var db = require('./db');
var _ = require('lodash');
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
				if(checkTriggerConditions(triggers, deviceRaw)) {
					printChunk(chunk);
					console.log("TRIGGERS\n", triggers)
					getBlockFromChunk('action', chunk, function(actions) {
						console.log("ACTIONS\n", actions)
						//Yay! we have actions. Now we need data (from Case's FE) and then we can call Pitcher!!!!!!
					})
				}
			});
		})
		//NOTES: I'd like to know by the "type" function name weather it is a trigger or an action
		//I'd like some data to play with in this same area.
		//I'd take the data & method and the raw device data and pump that into checkTriggerConditions(chunkTrigger, rawDevice)
		
		
	});
	
}

var checkTriggerConditions = function(chunkTriggers, deviceRaw) {
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
		for (var i = 0; i < chunkTriggers.length; i++) {
			for (var j = 0; j < allTriggers.length; j++) {
				if (allTriggers[j].id === chunkTriggers[i].id) {
					console.log("\nCHUNK: ", chunkTriggers[i], "\nDEVICE: ", allTriggers[j]);
					//ok cool. I've now got what I need to check devices against eachother.
				};	
			};
		};

	});

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
		
		function prettyJSON(obj) {
		    console.log(JSON.stringify(obj, null, " "));
		}
	}
	console.log("***************************************************");
}

module.exports = {Coach: Coach};