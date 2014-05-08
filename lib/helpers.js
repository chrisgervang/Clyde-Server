var db = require('./db');
var _ = require('lodash');
function prettyJSON(obj) {
    console.log(JSON.stringify(obj, null, " "));
}
var Mob = function() {
	//add
	//destroy
	//find
	var collection = [];
	this.add = function(element) {
		collection.push(element);
		return collection;
	}
	this.destroy = function(id) {
		collection.forEach(function(device, index, array){
			if (device.id === id) {
				collection = collection.splice(index, 1);
				return collection;
			}
		});
	}
	this.find = function (id) {
		for (var i = 0; i < collection.length; i++) {
			
			if (collection[i].id === id) {
				//passing back collection reference to be able to update Mob easily.
				return collection[i];
			}
		};
		
	}
	this.update = function(id, data) {
		collection.forEach(function(element, index, array){
			if (element.id === id) {
				collection[index] = data;
			}
		});
	}
	this.info = function() {
		console.log("Count: " + collection.length);
		for (var i = 0; i < collection.length; i++) {
			console.log("Id: ", collection[i].id);
		};
	}
	this.getTriggeredChunk = function(id, cb) {
		for (var i = 0; i < collection.length; i++) {
			_.forOwn(collection[i].savedBlocks, function(savedBlock, key){
				for (var k = 0; k < collection[i].savedBlocks[key].blockRef.devicesRef.length; k++) {
					//console.log(collection[i].savedBlocks[key].blockRef.devicesRef[k].id);
					if(collection[i].savedBlocks[key].blockRef.devicesRef[k].id === id && collection[i].savedBlocks[key].blockRef.sortType === 'trigger') {
						cb(collection[i]);
					}
				};
			});
		};
	}

}

var chunkMob = new Mob();

var Coach = function() {
	var chunksRef = new db('chunks');

	//load Chunks as array
	chunksRef.load(function(chunks){
		expandChunks(chunks, function(chunk){
			chunkMob.add(chunk);
			chunkMob.info();
			printChunk(chunk);
		});
	});

	chunksRef.root.on('child_changed', function(snapshot) {
		var newChunk = snapshot.val();
		
		//fill in new chunk just like when we initially loaded it in.
		expandChunks([newChunk], function(chunk){
			chunkMob.update(snapshot.val().id, chunk);
			console.log("CHUNK UPDATED");
			chunkMob.info();
			printChunk(chunkMob.find(snapshot.val().id));
		});
	});

	var devicesRef = new db('devices');

	devicesRef.root.on('child_changed', function(snapshot){
		var deviceRaw = snapshot.val();
		//console.log("SHIT HAPPENED", deviceRaw);
		chunkMob.getTriggeredChunk(deviceRaw.id, function(chunk){
			//TODO: Check on a trigger by trigger basis to see if the conditions changed warrent the actions to fire.
			//I THINK IS ANY TRIGGER CHANGES AT ALL, THE ACTIONS WILL FIRE. THERE NEEDS TO BE SMART CONDITIONS TO KNOW IF A TRIGGER HAS SIMPLY CHANGED OR IF IT'S SUPPOSED TO FIRE ACTIONS NOW. 
			//each block is set up with different Data for it's Type Method. I need a function that checks if those conditions result in a true or a false for every simple unique trigger device.
			//console.log("CHUNKS\n", chunk)
			getBlockFromChunk('trigger', chunk, function(triggers) {
				checkTriggerConditions(triggers, deviceRaw, function(result){ 
					if(result) {
						printChunk(chunk);
						console.log("TRIGGERS\n");
						prettyJSON(triggers);
						getBlockFromChunk('action', chunk, function(actions) {
							console.log("ACTIONS\n");
							prettyJSON(actions);
							//Pitcher(actions);
							//Yay! we have actions. Now we need data (from Case's FE) and then we can call Pitcher!!!!!!
						})
					}
				})

				
			});
		})
		//NOTES: I'd like to know by the "type" function name weather it is a trigger or an action
		//I'd like some data to play with in this same area.
		//I'd take the data & method and the raw device data and pump that into checkTriggerConditions(chunkTrigger, rawDevice)
		
		
	});
	
}

var Pitcher = function(baseballs) {
	//does not support Groups yet. It just splits them apart into each action.
	var POST = function(raw, cb) {
		var request = require('request');
		prettyJSON(raw);
		var options = {
		  uri: 'http://76.220.54.203:8000/command',
		  method: 'POST',
		  json: raw
		};

		request(options, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		    console.log(body.id) // Print the shortened url.
		    cb(body);
		  } else {
		  	console.log("POST error to Pi");
		  	prettyJSON({post: {error: error, body: body}});
		  }
		});
	} 

	for (var i = 0; i < baseballs.length; i++) {
		var baseball = {
		    "command": {
		        "id": [baseballs[i].id],
				"func": baseballs[i].func,
		      "data": baseballs[i].data
		    }
		}
		//prettyJSON(baseball);
		POST(baseball, function(response){
			console.log("Fastball pitched!", response);
		});
	};

}

var checkTriggerConditions = function(chunkTriggers, deviceRaw, cb) {
	//break out into the various types of func's we can have. 
	
	var getOtherDevices = function(chunkTriggers, deviceRaw, cb) {
		var rawDevices = [deviceRaw];
		//assume deviceRaw is only one device
		for (var i = 0; i < chunkTriggers.length; i++) {
			if (chunkTriggers[i].id !== deviceRaw.id) {
				var devicesRef = new db('devices/' + chunkTriggers[i].id);
				devicesRef.root.once('value', function(snapshot) {
					rawDevices.push(snapshot.val());
					//cb when all other devices are loaded
					if (i === chunkTriggers.length-1) {
						cb(rawDevices);
					};
				});
			}	
		};
	}
	
	getOtherDevices(chunkTriggers, deviceRaw, function(allTriggers) {
		//console.log(chunkTriggers, allTriggers);
		//now we have all chunkTriggers and allTriggers. GAME TIME.
		var successCount = 0;
		var failCount = 0;
		for (var i = 0; i < chunkTriggers.length; i++) {
			for (var j = 0; j < allTriggers.length; j++) {
				if (allTriggers[j].id === chunkTriggers[i].id) {
					console.log("\nCONFIG: ", chunkTriggers[i], "\nDEVICE: ", allTriggers[j]);
					//ok cool. I've now got what I need to check devices against eachother.
					checkConditions(chunkTriggers[i], allTriggers[j], function(result) {
						console.log("RESLT", result)
						if (result) {
							successCount++;
						} else {
							failCount++;
						}
						if (successCount === chunkTriggers.length) {
							console.log("SUCCESS", successCount);
							cb(true);
						} else if (failCount !== 0) {
							console.log("FAIL", failCount);
							cb(false);
						};
					});
				};	
			};
		};

	}); 

}

var checkConditions = function(config, device, cb) {
	if (device.designRef === "weather") {
		cb(true);
	} else if (device.designRef === "time") {
		
		//is time [before/after] [minutes] of {sunrise}
		if (config.func === 'timeSunrise') {
			var setIfBeforeAfter = _.find(config.data, {dataType: "setIfBeforeAfter"});
			var setTimeMedium = _.find(config.data, {dataType: 'setTimeMedium'});
			if(setIfBeforeAfter.dataValue === 'before') {
				//is current time less than sunrise, yet greater than sunrise - 30 minutes?
			} else if(setIfBeforeAfter.dataValue === 'after') {
				//is current time greater than sunrise, yet less than sunrise + 30 minutes?
			}
		} else if (config.func === 'timeSunset') {
			var setIfBeforeAfter = _.find(config.data, {dataType: "setIfBeforeAfter"});
			var setTimeMedium = _.find(config.data, {dataType: 'setTimeMedium'});
			console.log("HUH", data_1);
			if(setIfBeforeAfter.dataValue === 'after') {
				//is current time less than sunset, yet greater than sunset - 30 minutes?
			} else if(setIfBeforeAfter.dataValue === 'after') {
				//is current time greater than sunset, yet less than sunset + 30 minutes?
			}
		} else if (config.func === 'time') {
			var tz = require("timezone");

			
			function fromUTC(ms) {
				var us = tz(require("timezone/America"));

				console.log(us(ms, "%F %T", "America/Los_Angeles"));
				return us(ms, "%F %T", "America/Los_Angeles");
			}
			function toUTC(date) {
				var us = tz(require("timezone/America"));

				console.log(us(date, "America/Los_Angeles"));
				return us(date, "America/Los_Angeles")
			}

			var settime24hour = _.find(config.data, {dataType: "settime24hour"});
			var configTime = fromUTC(settime24hour.dataValue);
			var deviceTime = fromUTC(device.state.timeStamp);
			//If config.time

			//console.log(configTime, "SHIP", settime24hour.dataValue, tz("2000-01-01 07:30-07:00"), "BOAT", tz(configTime, "%H"), tz(configTime, "%M"), "TUG", settime24hour.dataValue);
			console.log("TUG", configTime, "SHIP", settime24hour.dataValue, "BOAT", tz(settime24hour.dataValue, "%H"), tz(settime24hour.dataValue, "%M"));
			console.log("TUG", deviceTime, "SHIP", device.state.timeStamp, "BOAT", tz(device.state.timeStamp, "%H"), tz(device.state.timeStamp, "%M"));
			
			//check if UTC minute and hour from device and config match
			if (tz(settime24hour.dataValue, "%H") === tz(device.state.timeStamp, "%H") && tz(device.state.timeStamp, "%M") === tz(settime24hour.dataValue, "%M")) {
				console.log("they be true!!!!!!!!");
				cb(true);
			} else {
				cb(false);
			}

		}
	}
}

var getBlockFromChunk = function(savedType, chunk, cb) {
	var blocks = [];

	_.forOwn(chunk.savedBlocks, function(savedBlock, key){
		for (var k = 0; k < chunk.savedBlocks[key].blockRef.devicesRef.length; k++) {
			if(chunk.savedBlocks[key].savedType === savedType) {
				var device = chunk.savedBlocks[key].blockRef.devicesRef[k];
				var savedSelection = chunk.savedBlocks[key].savedSelection;
				var savedSetting = chunk.savedBlocks[key].savedSettings[savedSelection];

				var distilledDevice = {
					id: device.id,
					func: savedSetting.function,
					data: loadSavedData(savedSetting)
				}
				// console.log("GET CHUNK ACTIONS");
				blocks.push(distilledDevice);
			}
		};
	});
	cb(blocks);
}

//accepts an array only!! 
var expandChunks = function(chunks, cb) {
	//console.log("CHUNKS START\n", chunks, "\nCHUNKS END");
	var blocksRef = new db('blocks');
	//load block references as a obj list
	blocksRef.loadAsList(function(blocks){
		//console.log("BLOCKS START\n", blocks, "\nBLOCKS END");
		
		var devicesRef = new db('devices');
		//load devices as a obj list
		devicesRef.loadAsList(function(devices){		
		
			//CHUNK LEVEL
			chunks.forEach(function(chunk, index, array) {
				//change deviceList to savedBlocks

				_.forOwn(chunk.savedBlocks, function(savedBlock, key){
					//I question why 'id' is in each deviceList
					

					var block = blocks[savedBlock.blockRef]
					delete block.color;
					delete block.iconClass;
					delete block.slug;

					//console.log(savedBlock.blockRef, "\nBLOCKKKKKKK\n", block);
					//DEVICE LEVEL
					for (var i = 0; i < block.devicesRef.length; i++) {
						//console.log("DEVICE REF\n", block.devicesRef[i]);
						var deviceRef = block.devicesRef[i];
						
						//console.log("LEN: ", block.devicesRef.length, "ID: ", devicesRef_f, "DEVICE: ", device);
						
						if (typeof deviceRef === 'string') {
							var device = devices[deviceRef];
							delete device.type;
							delete device.userId;
							delete device.settings;
							delete device.state;
							// for (var j = 0; j < device.blockOptions.length; j++) {
							// 	delete device.blockOptions[j].copy;
							// 	delete device.blockOptions[j].label;
							// };
							//console.log("DEVICE BUILT\n", device);
							block.devicesRef[i] = device;
							//console.log("KJHFKJDSH", block.devicesRef[i+1]);
						} else {
							console.log("deviceRef isn't a string!! Probably has already been coached. OK if it has an id:", deviceRef.id);
							//block.devicesRef[i].missing = true;
							//console.log(devices);
						}
					};
					// console.log("BLOCK REF BUILT\n", savedBlock.blockRef);
					// console.log("BLOCK BUILT\n", block);
					// console.log("BLOCK CHUNk\n", chunk.savedBlocks);
					chunk.savedBlocks[key].blockRef = block;
				})
				//console.log("CHUNK BUILT\n",chunk);
				
				cb(chunk);
			})
		})

	})
}

var loadSavedData = function(savedSetting) {
	var data = [];
	if (savedSetting.function === "lightSwitchState") {
		data.push({dataType: "setIfBoolean", dataValue: savedSetting.setIfBoolean});
	} else if (savedSetting.function === "lightSwitchBrightness") {
		data.push({dataType: "setPercent100", dataValue: savedSetting.setPercent100});
	} else if (savedSetting.function === "lightSwitchToggle") {
		data.push({dataType: "setToggle", dataValue: savedSetting.setToggle});
	} else if (savedSetting.function === "time") {
		data.push({dataType: "settime24hour", dataValue: savedSetting.settime24hour});
	} else if (savedSetting.function === "timeSunrise") {
		data.push({dataType: "setIfBeforeAfter", dataValue: savedSetting.setIfBeforeAfter});
		data.push({dataType: "setTimeMedium", dataValue: savedSetting.setTimeMedium});
	} else if (savedSetting.function === "timeSunset") {
		data.push({dataType: "setIfBeforeAfter", dataValue: savedSetting.setIfBeforeAfter});
		data.push({dataType: "setTimeMedium", dataValue: savedSetting.setTimeMedium});
	} else if (savedSetting.function === "weatherType") {
 		data.push({dataType: "setIfBoolean", dataValue: savedSetting.setIfBoolean});
 		data.push({dataType: "setWeatherType", dataValue: savedSetting.setWeatherType});
	} else if (savedSetting.function === "speakerSpotify") {
		data.push({dataType: "setSpotifyPlaylist", dataValue: savedSetting.setSpotifyPlaylist});
	} else if (savedSetting.function === "speakerPandora") {
		data.push({dataType: "setPandoraPlaylist", dataValue: savedSetting.setPandoraPlaylist});
	} else if (savedSetting.function === "speakerTextToSpeech") {
		data.push({dataType: "setInputText", dataValue: savedSetting.setInputText});
		data.push({dataType: "setVoiceGender", dataValue: savedSetting.setVoiceGender});
		data.push({dataType: "setVoiceType", dataValue: savedSetting.setVoiceType});

	}
	return data;
}

var printChunk = function(chunk, raw) {
	//WTF is this chunk doing? run to find out!
	console.log("***************************************************");
	console.log("*  chunk print time~~")
	console.log("~~~~ Actions:");
	_.forOwn(chunk.savedBlocks, function(savedBlock, iAction){
		var block = chunk.savedBlocks[iAction].blockRef;
		var savedSelection = chunk.savedBlocks[iAction].savedSelection;
		var savedSetting = chunk.savedBlocks[iAction].savedSettings[savedSelection];
		if (block.sortType === 'action' && block.sortCategory === 'group') {
			//console.log(block);
			console.log("~~~~~~~ " + block.name + " (" + block.sortCategory + ")");

			//count number of unique devices
			var count = 1;
			for (var qAction = 0; qAction < block.devicesRef.length; qAction++) {
				
				var device = block.devicesRef[qAction];
				var design = device.designRef;
				if (qAction < block.devicesRef.length && !!block.devicesRef[qAction + 1] && design === block.devicesRef[qAction + 1].designRef) {
					//console.log("DESIGN CHECK",design);
					count++;
				} else {
					for (var qActionCount = qAction; qActionCount < count - 1 + qAction; qActionCount++) {
						//console.log("qActioncount:",qAction," LEN:", count - 1 +qAction);
						block.devicesRef[qActionCount].count = count;	
					};
					
					var savedData = loadSavedData(savedSetting);
					var savedDataToString = "";
					for (var i = 0; i < savedData.length; i++) {
						savedDataToString += savedData[i].dataValue + " {" + savedData[i].dataType + "} | ";
					};
					console.log("~~~~~~~~~ " + device.count + "x " + savedSetting.function + ": " + savedDataToString + " (" + device.designRef + ")");
					count = 1;
				}
			}
		} else if (block.sortType === 'action' && (block.sortCategory === 'device' || block.sortCategory === 'cloud')) {
			var device = block.devicesRef[0];
			console.log("~~~~~~~ " + block.name + " (" + block.sortCategory + ")");
			var savedData = loadSavedData(savedSetting);
			var savedDataToString = "";
			for (var i = 0; i < savedData.length; i++) {
				savedDataToString += savedData[i].dataValue + " {" + savedData[i].dataType + "} | ";
			};
			console.log("~~~~~~~~~ " + 1 + "x " + savedSetting.function + ": " + savedDataToString + " (" + device.designRef + ")");
		}
	
	});

	console.log("~~~~ Triggers:");
	_.forOwn(chunk.savedBlocks, function(savedBlock, iTrigger){
		var block = chunk.savedBlocks[iTrigger].blockRef;
		var savedSelection = chunk.savedBlocks[iTrigger].savedSelection;
		var savedSetting = chunk.savedBlocks[iTrigger].savedSettings[savedSelection];
		if (block.sortType === 'trigger' && block.sortCategory === 'group') {
			//console.log(block);
			console.log("~~~~~~~ " + block.name + " (" + block.sortCategory + ")");

			//count number of unique devices
			var count = 1;
			for (var qTrigger = 0; qTrigger < block.devicesRef.length; qTrigger++) {
				
				var device = block.devicesRef[qTrigger];
				var design = device.designRef;
				if (qTrigger < block.devicesRef.length && !!block.devicesRef[qTrigger + 1] && design === block.devicesRef[qTrigger + 1].designRef) {
					//console.log("DESIGN CHECK",design);
					count++;
				} else {
					for (var qTriggerCount = qTrigger; qTriggerCount < count - 1 + qTrigger; qTriggerCount++) {
						//console.log("qTriggercount:",qTrigger," LEN:", count - 1 +qTrigger);
						block.devicesRef[qTriggerCount].count = count;	
					};
					//var methodName = device.blockOptions[methodNumber].sortType;
					console.log("~~~~~~~~~ " + device.count + "x " + "(methodName)" + " (" + device.designRef + ")");
					count = 1;
				}
			}
		} else if (block.sortType === 'trigger' && (block.sortCategory === 'device' || block.sortCategory === 'cloud')) {
			var device = block.devicesRef[0];
			console.log("~~~~~~~ " + block.name + " (" + block.sortCategory + ")");
			var savedData = loadSavedData(savedSetting);
			var savedDataToString = "";
			for (var i = 0; i < savedData.length; i++) {
				savedDataToString += savedData[i].dataValue + " {" + savedData[i].dataType + "} | ";
			};
			console.log("~~~~~~~~~ " + 1 + "x " + savedSetting.function + ": " + savedDataToString + " (" + device.designRef + ")");
		}
	});
	if(!!raw) {
		console.log("~~~~~~~~~~~~~~~~~~~THE RAW STUFF~~~~~~~~~~~~~~~~~~~");
		prettyJSON(chunk);
	}
	console.log("***************************************************");
}

module.exports = {Coach: Coach};