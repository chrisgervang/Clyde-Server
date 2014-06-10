var db 	  = require('./db'),
	_  	  = require('lodash'),
	utils = require('./utility');

var chunkMob = new utils.Mob();

/**
 * Coach handels incoming configuartion data, and device data.
 * 
 * It facilitates moving data around, and asking for the meaning of said data. 
 * Coach maintains an always up to date collection of chunk configuration. 
 * Coach listens to our firebase for new 'chunk' and 'device' data. 
 * In the event a new piece of 'device' data comes in that is a 'trigger' then
 * call {Function} checkTriggerConditions to check if any device
 * 'action' should occur. Device 'action' is passed along to our Raspberry Pi hub
 * by calling {Function} Pitcher.
 */

var Coach = function() {
	var chunksRef = new db('chunks');
	var devicesRef = new db('devices');

	//Initilize That-When-This configuration data, called a Chunk.
	
	chunksRef.load(function(chunks){
		
		//load Chunks as array of Objects. Then Expand the chunks.

		utils.expandChunks(chunks, function(chunk){
			chunkMob.add(chunk);
			chunkMob.info();
			utils.printChunk(chunk);
		});
	});

	//load Chunk {Object} that has changed 
	
	chunksRef.root.on('child_changed', function(snapshot) {
		var newChunk = snapshot.val();
		
		//fill in new chunk data just like when we initially loaded it in.
		
		utils.expandChunks([newChunk], function(chunk){
			chunkMob.update(snapshot.val().id, chunk);
			console.log("CHUNK UPDATED");
			chunkMob.info();
			utils.printChunk(chunkMob.find(snapshot.val().id));

			var chunk = chunkMob.find(snapshot.val().id);
			utils.printChunk(chunk);
			
			//if lightswitch is an active trigger, then start shouter. 
			
			getBlockFromChunk('trigger', chunk, function(triggers) {
				// var devicesRef = new db('devices');
				devicesRef.loadAsList(function(devices){
					for (var i = 0; i < triggers.length; i++) {
						var dev = devices[triggers[i].id];
						if (!!dev.id && dev.designRef === 'insteonLightSwitch') {
							console.log("found insteon trigger");
							var baseball = [
								{
									id: dev.id, 
									func: "shouter", 
									data: [
										{
							            "label": "sendCommand",
							            "data": "start"
								    	}
								    ]
								}
							];
							Pitcher(baseball);
						}
					}
				});
			});
			
			//if sonos is an active action, then start shouter.
			
			getBlockFromChunk('action', chunk, function(actions){
				// var devicesRef = new db('devices');
				devicesRef.loadAsList(function(devices){
					for (var i = 0; i < actions.length; i++) {
						var dev = devices[actions[i].id];
						if (!!dev.id && dev.designRef === 'sonosSpeaker') {
							console.log("found sonos action");
							var baseball = [
									{
										id: dev.id, 
										func: "shouter", 
										data: [
											{
								            "label": "sendCommand",
								            "data": "start"
									    	}
									    ]
									}
								];
								Pitcher(baseball)
							}
						}
				});
			});
		});
	});
	
	chunksRef.root.on('child_removed', function(snapshot){
		//TODO: if lightswitch is not an active trigger then stop shouter.
		//		if sonos isn't an active action then stop shouter.
	});

	devicesRef.root.on('child_changed', function(snapshot){
		var deviceRaw = snapshot.val();
		
		//gather chunk {Object} 

		chunkMob.getTriggeredChunk(deviceRaw.id, function(chunk){ 

			//gather all device {Object} that are triggers
			
			getBlockFromChunk('trigger', chunk, function(triggers) {
				
				//check to see if the conditions changed warrent the actions to fire.
				
				checkTriggerConditions(triggers, deviceRaw, function(result){ 
					if(result) {
						utils.printChunk(chunk);
						console.log("TRIGGERS\n");
						utils.prettyJSON(triggers);
						getBlockFromChunk('action', chunk, function(actions) {
							console.log("ACTIONS\n");
							utils.prettyJSON(actions);
							Pitcher(actions);
						});
					}
				}); //end checkTriggerConditions
			}); //end getBlockFromChunk
		}); //end getTriggeredChunk
	}); //end devicesRef on 'child_changed'
	
}

var Pitcher = function(baseballs) {
	//does not support Groups yet. It just splits anything that looks like one apart into many actions.
	for (var i = 0; i < baseballs.length; i++) {
		var baseball = {
		    "command": {
		        "id": [baseballs[i].id],
				"func": baseballs[i].func,
		      "data": baseballs[i].data
		    }
		};
		utils.POST(baseball, function(response){
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
					console.log("VALUES: I:", i, "LENGTH -1: ", chunkTriggers.length-1, "PUSHED:", snapshot.val().id);
					if (i === chunkTriggers.length-1) {
						cb(rawDevices);
					};
				});
			} else if (chunkTriggers.length === 1) {
				//cb when all
				cb(rawDevices);
			} else if (chunkTriggers.length === rawDevices.length) {
				console.log("ELSE VALUES: I:", i, "LENGTH -1: ", chunkTriggers.length-1, "PUSHED:", chunkTriggers[i].id);
			}
		};
	}
	
	getOtherDevices(chunkTriggers, deviceRaw, function(allTriggers) {
		console.log("getOtherDevices", chunkTriggers, allTriggers);
		//now we have all chunkTriggers and allTriggers. GAME TIME.
		var successCount = 0;
		var failCount = 0;
		for (var i = 0; i < chunkTriggers.length; i++) {
			for (var j = 0; j < allTriggers.length; j++) {
				if (allTriggers[j].id === chunkTriggers[i].id) {
					//console.log("\nCONFIG: ", chunkTriggers[i], "\nDEVICE: ", allTriggers[j]);
					//ok cool. I've now got what I need to check devices against eachother.
					checkConditions(chunkTriggers[i], allTriggers[j], function(result) {
						//console.log("RESLT", result)
						if (result) {
							successCount++;
						} else {
							failCount++;
						}
						if (successCount === chunkTriggers.length) {
							console.log("SUCCESS", successCount);
							cb(true);
						} else if (failCount !== 0) {
							console.log("FAIL", failCount, "SUCCEED", successCount);
							cb(false);
						};
					});
				};	
			};
		};

	}); 

}

var checkConditions = function(config, device, cb) {
	var tz = require("timezone");
	if (device.designRef === "insteonLightSwitch") {
		if (config.func === "lightSwitchState") {
			var setIfOnOff = _.find(config.data, {label: "setIfOnOff"});
			console.log("setIfOnOff", setIfOnOff)
			if (device.state.on === true && setIfOnOff.data === true) {
				cb(true);
			} else if (device.state.on === false && setIfOnOff.data === false) {
				cb(true);
			} else {
				cb(false);
			}
		}
	} else if (device.designRef === "weather") {
		//TODO: local weather checking via weather underground
		cb(true);
	} else if (device.designRef === "date") {
		if (config.func === 'dateDayOfWeek') {
			var setDateDay = _.find(config.data, {label: "setDateDay"});
			//TODO: load in user's locale from user database
			var us = tz(require("timezone/America"));
			console.log("DAY OF WEEK", us(device.state.timeStamp,"America/Los_Angeles", "%u"));
			//console.log("DAY OF WEEK", us(device.state.timeStamp,"America/Los_Angeles", "%w"));
			if(setDateDay.data === "monday" && parseInt(us(device.state.timeStamp,"America/Los_Angeles", "%u")) === 1) {
				cb(true);
			} else if(setDateDay.data === "tuesday" && parseInt(us(device.state.timeStamp,"America/Los_Angeles", "%u")) === 2) {
				cb(true);
			} else if(setDateDay.data === "wednesday" && parseInt(us(device.state.timeStamp,"America/Los_Angeles", "%u")) === 3) {
				cb(true);
			} else if(setDateDay.data === "thursday" && parseInt(us(device.state.timeStamp, "America/Los_Angeles","%u")) === 4) {
				cb(true);
			} else if(setDateDay.data === "friday" && parseInt(us(device.state.timeStamp,"America/Los_Angeles", "%u")) === 5) {
				cb(true);
			} else if(setDateDay.data === "saterday" && parseInt(us(device.state.timeStamp,"America/Los_Angeles", "%u")) === 6) {
				cb(true);
			} else if(setDateDay.data === "sunday" && parseInt(us(device.state.timeStamp,"America/Los_Angeles", "%u")) === 7) {
				cb(true);
			} else if(setDateDay.data === "weekday" && parseInt(us(device.state.timeStamp,"America/Los_Angeles", "%u")) <= 5 && parseInt(us(device.state.timeStamp, "%u")) >= 1) {
				cb(true);
			} else if(setDateDay.data === "weekend" && parseInt(us(device.state.timeStamp,"America/Los_Angeles", "%u")) >= 6 && parseInt(us(device.state.timeStamp, "%u")) <= 7) {
				cb(true);
			} else {
				cb(false);
			}
        }
	} else if (device.designRef === "time") {
		//is time [before/after] [minutes] of {sunrise}
		var us = tz(require("timezone/America"));
		//CURRENT ASSUMPTIONS: sunset/sunrise works like a cushion (returns true if time is in a range). time works like an event (returns true if it's an exact time). 
		if (config.func === 'timeSunrise') {
			var setIfBeforeAfter = _.find(config.data, {label: "setIfBeforeAfter"});
			var setTimeMedium = _.find(config.data, {label: 'setTimeMedium'});
			console.log("SUNRISE");

			if(setIfBeforeAfter.data === 'before') {
				//is current time less than sunrise, yet greater than (sunrise - 30 minutes)?
				var beforeSunriseTime = device.state.sunrise - (setTimeMedium.data * 60000);
				utils.fromUTC(beforeSunriseTime);
				utils.fromUTC(device.state.timeStamp);
				if(tz(beforeSunriseTime, "%H") === tz(device.state.timeStamp, "%H") && tz(device.state.timeStamp, "%M") === tz(beforeSunriseTime, "%M") ) {
					console.log("Time is before sunrise, yet the cushion range!!!");
					cb(true);
				} else {
					cb(false);
				}
					
			} else if(setIfBeforeAfter.data === 'after') {
				//is current time greater than sunrise, yet less than (sunrise + 30 minutes)?
				var afterSunriseTime = device.state.sunrise + (setTimeMedium.data * 60000);
				utils.fromUTC(afterSunriseTime);
				utils.fromUTC(device.state.timeStamp);
				if(tz(afterSunriseTime, "%H") === tz(device.state.timeStamp, "%H") && tz(device.state.timeStamp, "%M") === tz(afterSunriseTime, "%M") ) {
					console.log("Time is after sunrise, yet the cushion range!!!");
					cb(true);
				} else {
					cb(false);
				}
			}
		} else if (config.func === 'timeSunset') {
			var setIfBeforeAfter = _.find(config.data, {label: "setIfBeforeAfter"});
			var setTimeMedium = _.find(config.data, {label: 'setTimeMedium'});
			console.log("SUNSET");

			if(setIfBeforeAfter.data === 'before') {
				//is current time less than sunset, yet greater than (sunset - 30 minutes)?
				var beforeSunsetTime = device.state.sunset - (setTimeMedium.data * 60000);
				utils.fromUTC(beforeSunsetTime);
				utils.fromUTC(device.state.timeStamp);
				if(tz(beforeSunsetTime, "%H") === tz(device.state.timeStamp, "%H") && tz(device.state.timeStamp, "%M") === tz(beforeSunsetTime, "%M") ) {
					console.log("Time is before sunset, yet the cushion range!!!");
					cb(true);
				} else {
					cb(false);
				}	
			} else if(setIfBeforeAfter.data === 'after') {
				//is current time greater than sunset, yet less than (sunset + 30 minutes)?
				var afterSunsetTime = device.state.sunrise + (setTimeMedium.data * 60000);
				utils.fromUTC(afterSunsetTime);
				utils.fromUTC(device.state.timeStamp);
				if(tz(afterSunsetTime, "%H") === tz(device.state.timeStamp, "%H") && tz(device.state.timeStamp, "%M") === tz(afterSunsetTime, "%M") ) {
					console.log("Time is after sunset, yet the cushion range!!!");
					cb(true);
				} else {
					cb(false);
				}
			}
		} else if (config.func === 'time') {
			var settime24hour = _.find(config.data, {label: "settime24hour"});
			var configTime = utils.fromUTC(settime24hour.data);
			var deviceTime = utils.fromUTC(device.state.timeStamp);
			
			//check if UTC minute and hour from device and config match
			
			if (us(settime24hour.data,"America/Los_Angeles", "%H") === us(device.state.timeStamp,"America/Los_Angeles", "%H") && us(settime24hour.data,"America/Los_Angeles", "%M") === us(device.state.timeStamp,"America/Los_Angeles", "%M")) {
				console.log("they be true!!!!!!!!");
				cb(true);
			} else {
				cb(false);
			}

		}
	} else if(device.designRef === 'insteonLightSwitch') {
		if (config.func = 'lightSwitchState') {
			var setIfOnOff = _.find(config.data, {label: "setIfOnOff"});

			if (setIfOnOff.data === true && device.state.on === true) {
				cb(true);
			} else if (setIfOnOff.data === false && device.state.on === false) {
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
				var savedSetting;
				if (savedSelection === false) {
					savedSetting = {function: "waiting", savedData: {label: "userChoice", data: "waiting"}}
				} else {
					savedSetting = chunk.savedBlocks[key].savedSettings[savedSelection];
				}
				

				var distilledDevice = {
					id: device.id,
					func: savedSetting.function,
					data: savedSetting.savedData
				}
				// console.log("GET CHUNK ACTIONS");
				blocks.push(distilledDevice);
			}
		};
	});
	cb(blocks);
}

var loadSavedData = function(savedSetting) {
	var data = [];
	//console.log("SAVED SETTINGS", savedSetting);
	if (savedSetting.function === "lightSwitchState") {
		data.push({label: "setIfBoolean", data: savedSetting.setIfBoolean});
	} else if (savedSetting.function === "lightSwitchBrightness") {
		data.push({label: "setPercent100", data: savedSetting.setPercent100});
	} else if (savedSetting.function === "lightSwitchToggle") {
		data.push({label: "setToggle", data: savedSetting.setToggle});
	} else if (savedSetting.function === "time") {
		data.push({label: "settime24hour", data: savedSetting.settime24hour});
	} else if (savedSetting.function === "timeSunrise") {
		data.push({label: "setIfBeforeAfter", data: savedSetting.setIfBeforeAfter});
		data.push({label: "setTimeMedium", data: savedSetting.setTimeMedium});
	} else if (savedSetting.function === "timeSunset") {
		data.push({label: "setIfBeforeAfter", data: savedSetting.setIfBeforeAfter});
		data.push({label: "setTimeMedium", data: savedSetting.setTimeMedium});
	} else if (savedSetting.function === "weatherType") {
 		data.push({label: "setIfBoolean", data: savedSetting.setIfBoolean});
 		data.push({label: "setWeatherType", data: savedSetting.setWeatherType});
	} else if (savedSetting.function === "speakerSpotify") {
		data.push({label: "setSpotifyPlaylist", data: savedSetting.setSpotifyPlaylist});
	} else if (savedSetting.function === "speakerPandora") {
		data.push({label: "setPandoraPlaylist", data: savedSetting.setPandoraPlaylist});
	} else if (savedSetting.function === "speakerTextToSpeech") {
		data.push({label: "setInputText", data: savedSetting.setInputText});
		data.push({label: "setVoiceGender", data: savedSetting.setVoiceGender});
		data.push({label: "setVoiceType", data: savedSetting.setVoiceType});
	}
	return data;
}

var Shouter = function(config) {
	var data = {};
	var Firebase = require('firebase');
	var tz = require("timezone");
	var us = tz(require("timezone/America"));
	var Wunderground = require('wundergroundnode');
	var wunderground = new Wunderground('7b479519fb46817f');

	data.id = config.id;
	var that = this;
	var device = new Firebase('https://clydematt.firebaseio.com/devices/'+data.id); 
	device.once("value", function(result){
		
		data = result.val();
		console.log("\n\nShouter:\n", data.designRef, "\n", data.id);
		if (data.designRef === "time") {
			that.init();
		} else if (data.designRef === "date") {
			that.init();
		}

	});

	device.on('value', function(result){
		data = result.val();
		console.log("\n\nShouter:\n", data.designRef, "\n", data.id);
	});	

	this.init = function() {

		var that = this;
		if (data.designRef === "time") {
			data.settings.pollRate = 5000;
			console.log("INIT TIME");
			data.settings.process = setInterval(function(){
				that.ask(function(result) {
					//console.log("saved", tz(data.state.timeStamp, "%M"), "current", tz(result.timeStamp, "%M"));
					if (us(data.state.timeStamp,"America/Los_Angeles", "%M") !== us(result.timeStamp,"America/Los_Angeles", "%M")) {
						// Sculley: data change
						console.log("TIME CHANGE: MINUTE.");
						utils.fromUTC(result.timeStamp);
						data.state.timeStamp = result.timeStamp
						
						//Firebase: utils.Post up the device... maybe Catcher event!
						new Firebase("https://clydematt.firebaseio.com/devices/" + data.id + "/state/").update({timeStamp: data.state.timeStamp})
						
					}

					if(!!result.sunrise && data.state.sunrise !== result.sunrise) {
						console.log("TIME CHANGE: SUNRISE.");
						data.state.sunrise = result.sunrise;
						utils.fromUTC(data.state.sunrise);
						new Firebase("https://clydematt.firebaseio.com/devices/" + data.id + "/state/").update({sunrise: data.state.sunrise})
					}

					if(!!result.sunset && data.state.sunset !== result.sunset) {
						console.log("TIME CHANGE: sunset.");
						data.state.sunset = result.sunset;
						utils.fromUTC(data.state.sunset);
						new Firebase("https://clydematt.firebaseio.com/devices/" + data.id + "/state/").update({sunset: data.state.sunset})
					}
				});
			}, data.settings.pollRate);
		} else if (data.designRef === "date") {
			data.settings.pollRate = 5000;
			console.log("INIT DATE");
			data.settings.process = setInterval(function(){
				that.ask(function(result){
					if (us(data.state.timeStamp,"America/Los_Angeles", "%d") !== us(result.timeStamp,"America/Los_Angeles", "%d")) {
						console.log("DATE CHANGE: DAY.");
						utils.fromUTC(result.timeStamp);
						utils.fromUTC(data.state.timeStamp);
						data.state.timeStamp = result.timeStamp
						new Firebase("https://clydematt.firebaseio.com/devices/" + data.id + "/state/").update({timeStamp: data.state.timeStamp})
					};
				});
			}, data.settings.pollRate);
		}
	}
	this.ask = function(cb) {
		if (data.designRef === "time") {
			var state = {timeStamp: new Date().getTime()};

			//console.log(tz(data.state.timeStamp, "%d"), tz(state.timeStamp, "%d"));
			if (us(data.state.timeStamp,"America/Los_Angeles", "%d") !== us(state.timeStamp,"America/Los_Angeles", "%d")) {
				wunderground.astronomy().request("CA/Hillsborough", function(err, response){
   					console.log(response);
   					if (parseInt(response.sun_phase.sunrise.hour) < 10) {
   						response.sun_phase.sunrise.hour = '0' + response.sun_phase.sunrise.hour;
   					}
   					var riseDate = tz(state.timeStamp, "%F") + " " + response.sun_phase.sunrise.hour + ":" + response.sun_phase.sunrise.minute + ":00";
   					state.sunrise = us(riseDate, "America/Los_Angeles");
   					
   					if (parseInt(response.sun_phase.sunset.hour) < 10) {
   						response.sun_phase.sunset.hour = '0' + response.sun_phase.sunset.hour;
   					}
   					var setDate = tz(state.timeStamp, "%F") + " " + response.sun_phase.sunset.hour + ":" + response.sun_phase.sunset.minute + ":00";
   					state.sunset = us(setDate, "America/Los_Angeles");
   					
   					cb(state);
				});	
			} else {
				cb(state);	
			}
		} else if (data.designRef === "date") {
			var state = {timeStamp: new Date().getTime()};
			//test edge case where it's local 12AM time.
			cb(state);
		}
	}
}
new Shouter({id: "-JKapkxLZKlzMmsWgIjP"});
new Shouter({id: "-JKapoCZhbob0Kmh2AhG"});

module.exports = {Coach: Coach};