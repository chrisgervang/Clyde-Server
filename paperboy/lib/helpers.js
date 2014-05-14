var Firebase = require('firebase');
var clydedevices = new Firebase('https://clydematt.firebaseio.com/devices/');
var deviceDesignDB = new Firebase('https://clydematt.firebaseio.com/deviceDesigns/');
var _ = require('lodash');
var db = require('./db');



//Device API's
var sonos = require('sonos');
var WeMo = new require('wemo');
var Action = require('./Action');


//Init Device DB helper
var devices = new db("devices");
var initHubs;

devices.load(function(devices){
	var Insteon = require('./Insteon').Insteon;
	var initDevices = new Mob();
	initHubs = new Mob();
	//var gw;
	//console.log(devices);
	devices.forEach(function(device, index, array){

		if (device.designRef === "insteonHub") {
			console.log("insteonHub");
			Insteon(device, function(hub){
				initHubs.add(hub);
				console.log("connected to insteonHub", hub);
				// for (var i = 0; i < device.state.components.length; i++) {
				// 	initDevices.add(new Shouter({id: device.state.components[i]}));
				// };
				
			});
			
		} else if(device.designRef !== "insteonLightSwitch" && device.designRef !== "insteonSwitch") {
			//initDevices.add(new Shouter({id: device.id}));
		}
	})
});




//Shouter Rules
	//At very minimum, a shouter needs a 'uuid' & 'userid' to be created and a 'type' to actually run. 
	//If the 'type' search doesn't come back with anything after some time, then an error is thrown saying "Tried to create a Shouter for a [device], user: [userid]". 
	//If 'uuid' || 'userid' doesn't exist, also throw an error "The user or device doesn't exist"
var Shouter = function(config) {
	/*
	config: {
		onDemand: true;
	}
	*/

	var data = {
		//type: String*
		//user: String*
		//process: String*
		//pollRate: int*
		//macAddress: String*
		//id: String*
		/*device: {
			ip: String
			port: String
			online: String*
			state: {
				on: boolean
				motion: boolean
				color: String
				brightness: String
			}
		}*/
	}
	// process.on('uncaughtException', function (err) {
	//   console.log('Caught exception: ' + err);
	//   console.log("ERROOOOORRRRR", err, data);
	// });


	
	data.id = config.id;
	var that = this;
	var device = new Firebase('https://clydematt.firebaseio.com/devices/'+data.id);
	device.once("value", function(result){
		
		data = result.val();
		console.log("\n\nShouter:\n", data.designRef, "\n", data.id);
			//fill in data from Device Desighn Doc here. Based off data.type
		//validation here... write a helper funtion for grabbing from firebase + validation... called Umpire.getDevice({id},func...)
		
		if (data.designRef === "WeMo LightSwitch") {
			//TODO: connect a WeMo and finish WeMo Switch & LightSwitch
			var client = WeMo.Search();
			client.on('found', function(result){
				if (result.friendlyName.toString() === 'WeMo LightSwitch' && !data.designRef) {
					data.designRef = 'WeMo LightSwitch';
					data.macAddress = result.macAddress.toString();
					data.device.ip = result.ip;
					data.device.port = result.port;
					data.device.online = true;
					//Sculley: New Connection
					//Firebase: Post up the new device for the User
				}
			});
		} else if (data.designRef === "WeMo Motion") {
			var client = WeMo.Search();
			client.on('found', function(result){
				//console.log(result, result.devicedesignRef.toString() === 'urn:Belkin:device:sensor:1', !data.macAddress, data);
				if (result.devicedesignRef.toString() === 'urn:Belkin:device:sensor:1' && !data.macAddress) {
					data.designRef = 'WeMo Motion';
					data.macAddress = result.macAddress.toString();
					data.settings = {};
					data.settings.ip = result.ip;
					data.settings.port = result.port;
					data.settings.online = true;
					console.log(data);
					//Sculley: New Connection
					//Firebase: Post up the new device for the User
					that.init();
				} else if (result.devicedesignRef.toString() === 'urn:Belkin:device:sensor:1') {
					that.init();
				}
			});
		} else if (data.designRef === "wemoSwitch") {

		} else if (data.designRef === "SparkCore") {

		} else if (data.designRef === "Philips Hue") {

		} else if (data.designRef === "sonosSpeaker") {
			var client = sonos.search();
			client.on('DeviceAvailable', function(device, model) {
			  device.deviceDescription(function(err, details){
			  	//console.log("SONOS",details);
			  	//console.log("DATATATA",data);
			  	if (details.serialNum === data.settings.serialNum && data.settings.UDN === "_temp") {
			  		console.log("SONOS",device);
			  		data.settings.ip = device.host;
			  		data.settings.port = device.port;
			  		data.settings.online = true;
			  		data.settings.UDN = details.UDN;
			  		data.settings.modelName = details.modelName;

			  		console.log("SHIP",that,data);
					//Sculley: New Connection
					//Firebase: Post up the new device for the User
					new Firebase("https://clydematt.firebaseio.com/devices/" + data.id).update({settings: data.settings})
					that.init();
			  	} else if (details.serialNum === data.settings.serialNum) {
			  		console.log("SONOS",device);
			  		that.init();
			  	}
			  });
			});
		} else if (data.designRef === "Pebble") {

		} else if (data.designRef === "insteonLightSwitch") {
			//var Insteon = require('home-controller').Insteon;
			// data.local = {};
			// data.local.gw = new Insteon();
			//per LightSwitch: grab current "onLevel", "ramprate", "online"
			//SO connect to it. online (true or false). grab onLevel. grab rampRate. close connection. update firebase. that.init()
			// data.local.gw.connect(data.settings.hubIp, function(){
				initHubs.find(data.settings.hubId, function(gw) {
					console.log("HOME", gw);


					console.log("insteonLightSwitch CONNECT", data.settings.devID);
					data.settings.online = true;
					var successCount = 0;
					gw.onLevel(data.settings.devID, function(result, err){
						console.log("RESULT", result);
						data.settings.onLevel = result;
						successCount++;
						console.log("successCount", successCount);
						if (successCount === 2) {
							new Firebase("https://clydematt.firebaseio.com/devices/" + data.id).update({settings: data.settings})
							//data.local.gw.close();
							that.init();
						}
					});

					gw.rampRate(data.settings.devID, function(result, err){
						data.settings.rampRate = result;
						successCount++;
						console.log("successCount", successCount);
						if (successCount === 2) {
							new Firebase("https://clydematt.firebaseio.com/devices/" + data.id).update({settings: data.settings})
							//data.local.gw.close();
							that.init();
						}
					});
				// if (!!data.settings.devID) {
				// 	console.log('Connected!');
				// }
			//})
				})
		}

	});

	//separate as function so we can start a loop on the fly.
	this.init = function() {
		if (!data.state) {
			data.state = {hold: false};
		}
		data.state.hold = false;
		var that = this;
		

		if (data.designRef === "WeMo LightSwitch") {
			data.settings.process = setInterval(function(){
				that.ask(function(result) {
					if (result === 1) {
						result = true;
					} else {
						result = false;
					}
					console.log("ASK", result, data.device.state.on)
					if (data.device.state.on !== result) {
						// Sculley: data change
						console.log("CHANGE", result)
						data.device.state = {
							on: (result ? true : false)
						}
					}
				});
			}, data.settings.pollRate);
		} else if (data.designRef === "WeMo Motion") {
			data.settings.process = setInterval(function(){
				that.ask(function(result) {
					if (result === 1) {
						result = true;
					} else {
						result = false;
					}
					//console.log("ASK", result, data.device.state.motion)
					if (data.device.state.motion !== result) {
						// Sculley: data change
						//console.log("CHANGE", result)
						data.device.state = {
							motion: (result ? true : false)
						}
						console.log(data);
					}
				});
			}, data.settings.pollRate);
		} else if (data.designRef === "wemoSwitch") {
			data.settings.process = setInterval(function(){
				that.ask(function(result) {
					if (data.device.state.on !== result) {
						// Sculley: data change
						data.device.state = {
							on: (result ? true : false)
						}
					}
				});
			}, data.settings.pollRate);
		} else if (data.designRef === "SparkCore") {

		} else if (data.designRef === "Philips Hue") {

		} if (data.designRef === "insteonLightSwitch") {
			data.settings.pollRate = 2000;
			console.log("INIT INSTEON LIGHT SWITCH");
			data.state.ready = true;
			data.settings.process = setInterval(function(){
				if (data.state.ready ===  true) {
					data.state.ready = false;

					that.ask(function(result){
						//console.log("DATA STATE\n", data.state);
						//online
						data.state.ready = true;
						console.log("READY", data.settings.devID);
						if (data.state.online !== result.online) {
							// Sculley: data change
							console.log("INSTEON LIGHT SWITCH CHANGE: ONLINE.", result.online);
							data.state.online = (result.online ? true : false);
							//Firebase: Post up the device... maybe Catcher event!
							new Firebase("https://clydematt.firebaseio.com/devices/" + data.id + "/state/").update({online: data.state.online})
						}
						//light on (when level < 3 it is off)
						if (data.state.on !== result.on) {
							// Sculley: data change
							console.log("INSTEON LIGHT SWITCH CHANGE: on.", result.on);
							data.state.on = (result.on ? true : false);
							//Firebase: Post up the device... maybe Catcher event!
							new Firebase("https://clydematt.firebaseio.com/devices/" + data.id + "/state/").update({on: data.state.on})
						}
						
						//light level (keeps track of level)
						if (data.state.level !== result.level) {
							// Sculley: data change
							console.log("INSTEON LIGHT SWITCH CHANGE: level.", result.level);
							data.state.level = result.level;
							//Firebase: Post up the device... maybe Catcher event!
							if (!!data.state.level || data.state.level === 0) {
								new Firebase("https://clydematt.firebaseio.com/devices/" + data.id + "/state/").update({level: data.state.level})
							} else {
								console.log("Something went wrong with level:", data.state.level)
							}
							
						}
						//rampRate
						if (data.state.rampRate !== result.rampRate) {
							// Sculley: data change
							console.log("INSTEON LIGHT SWITCH CHANGE: rampRate.", result.rampRate);
							data.state.rampRate = result.rampRate;
							//Firebase: Post up the device... maybe Catcher event!
							new Firebase("https://clydematt.firebaseio.com/devices/" + data.id + "/settings/").update({rampRate: data.state.rampRate})
						}
						//onLevel
						if (data.state.onLevel !== result.onLevel) {
							// Sculley: data change
							console.log("INSTEON LIGHT SWITCH CHANGE: onLevel.", result.onLevel);
							data.state.onLevel = result.onLevel;
							//Firebase: Post up the device... maybe Catcher event!
							new Firebase("https://clydematt.firebaseio.com/devices/" + data.id + "/settings/").update({onLevel: data.state.onLevel})
						}
						//only run shouter once!!!

						if (config.onDemand === true) {
							console.log("ONE TIME USE... KILL", config);
							that.destroy();
						}
					});
				
				} else {
					console.log("NOT READY", data.settings.devID);
				}
				
			}, data.settings.pollRate)
		}else if (data.designRef === "sonosSpeaker") {
			data.settings.pollRate = 1000;
			console.log("INIT SONOS");
			data.settings.process = setInterval(function(){
				if (!data.state.hold) {
					that.ask(function(result) {
						if (!!result) {
							//console.log("DATA STATE\n", data.state);
							//is this device online
							if (data.state.online !== result.online) {
								// Sculley: data change
								console.log("SONOS CHANGE: ONLINE.", result.online);
								data.state.online = (result.online ? true : false);
								//Firebase: Post up the device... maybe Catcher event!
								new Firebase("https://clydematt.firebaseio.com/devices/" + data.id + "/state/").update({online: data.state.online})
							}
							//is this device playing
							if (data.state.playing !== result.playing && !!result.playing) {
								// Sculley: data change
								console.log("SONOS CHANGE: PLAYING.", result.playing);
								data.state.playing = result.playing;
								//Firebase: Post up the device... maybe Catcher event!
								new Firebase("https://clydematt.firebaseio.com/devices/" + data.id + "/state/").update({playing: data.state.playing})
							}
							//the play queue
							if (data.state.queue === "_temp" || _.difference(data.state.queue, result.queue).length !== 0) {
								// Sculley: data change
								console.log("SONOS CHANGE: QUEUE.", result.queue);
								data.state.queue = result.queue;
								//Firebase: Post up the device... maybe Catcher event!
								new Firebase("https://clydematt.firebaseio.com/devices/" + data.id + "/state/").update({queue: data.state.queue})
							}
							//current playing song
							if (!data.state.song || data.state.song.artist !== result.song.artist || data.state.song.title !== result.song.title || data.state.song.album !== result.song.album) {
								// Sculley: data change
								console.log("SONOS CHANGE: SONG.", result.song);
								data.state.song = result.song;
								//Firebase: Post up the device... maybe Catcher event!
								new Firebase("https://clydematt.firebaseio.com/devices/" + data.id + "/state/").update({song: data.state.song})
							}
							//the current volume
							if (data.state.volume !== result.volume) {
								// Sculley: data change
								console.log("SONOS CHANGE: VOLUME.", result.volume);
								data.state.volume = result.volume;
								//Firebase: Post up the device... maybe Catcher event!
								new Firebase("https://clydematt.firebaseio.com/devices/" + data.id + "/state/").update({volume: data.state.volume})
							}
							if (!_.isEqual(data.state.playlists,result.playlists)) {
								// Sculley: data change
								console.log("SONOS CHANGE: PLAYLISTS.", result.playlists);
								data.state.playlists = result.playlists;
								//Firebase: Post up the device... maybe Catcher event!
								new Firebase("https://clydematt.firebaseio.com/devices/" + data.id + "/state/").update({playlists: data.state.playlists})
							};
							//only run shouter once!!!
							
							if (config.onDemand === true) {
								console.log(config);
								that.destroy();
							}
						} else {
							console.log("RESULT FAILED", result);
						}
						
					});
				}
			}, data.settings.pollRate);
			//console.log(data.settings.process)

			// var processDB = new Firebase("https://clydematt.firebaseio.com/devices/" + data.id + "/settings/");
			// processDB.update({pollRate: data.settings.pollRate});
		} else if (data.designRef === "Pebble") {

		}
	}

	this.ask = function(cb){
		if (data.type === "WeMo LightSwitch") {
			var device = new WeMo(data.device.ip, data.device.port);
			device.getBinaryState(function(err, result){
				if (!!err) {
					//Bubble up error
					console.log(err);
					data.device.online = false;
				} else {
					cb(result);
				}
			});
		} else if (data.type === "WeMo Motion") {
			var device = new WeMo(data.device.ip, data.device.port);
			device.getBinaryState(function(err, result){
				if (!!err) {
					//Bubble up error
					console.log(err);
					data.device.online = false;
				} else {
					cb(result);
				}
			});
		} else if (data.type === "wemoSwitch") {
			var device = new WeMo(data.device.ip, data.device.port);
			device.getBinaryState(function(err, result){
				if (!!err) {
					//Bubble up error
					console.log(err);
					data.device.online = false;
				} else {
					cb(result);
				}
			});
		} else if (data.designRef === "SparkCore") {

		} else if (data.designRef === "Philips Hue") {

		} else if (data.designRef === "insteonLightSwitch") {
			/*
			console.time("insteonLightSwitch" + data.settings.devID);
			*/
			//var Insteon = require('home-controller').Insteon;
			//var gw = new Insteon();
			var state = {};
			//var successCount = 0;
			initHubs.find(data.settings.hubId, function(gw) {
					//console.log("HOME", gw);
					state.online = true;
					//console.log(gw.checkStatus(data.settings.devID));
					
					
						gw.level(data.settings.devID, function(result, err){
							state.level = result;
							if ((result < 2 || result === 0) && (err !== "404")) {
								state.on = false;
							} else if(err !== "404") {
								state.on = true;
							}

							if (err === "404") {
								console.log("ERROOOOORRRRR!!", err);
								data.state.ready = true;
							};
							if ((result === 0 && data.state.level > 0) && err !== "404") {
								data.state.hold = true;
							};
							if ((result === 0 && data.state.hold === true) && err !== "404") {
								console.log("checking again - please hold", data.state);
								setTimeout(function(){
									gw.level(data.settings.devID, function(result, err){
										state.level = result;
										if ((result < 2 || result === 0) && (err !== "404")) {
											state.on = false;
										} else if(err !== "404") {
											state.on = true;
										}

										if (err === "404") {
											console.log("ERROOOOORRRRR!!", err);
											data.state.ready = true;
										};

										if (result === 0 && err !== "404") {
											data.state.hold = false;
										};
										cb(state);
									});
								}, 500);
							} else if (err !== "404") {
								data.state.hold = false;
								cb(state);
							}
							
						});
					
					
			});

			// try {
			// 	data.local.gw.connect(data.settings.hubIp, function(){
			// 		state.online = true;
			// 		//successCount++;
					
			// 		/*
			// 		console.log("insteonLightSwitch ASK", data.settings.devID);
			// 		*/
					
			// 		//sorry to confuse structure here a bit. var state represent the "state" in the json. BUT
			// 		//I break a rule here: I add state.settings for rampRate & onLevel, because they aren't an active state, but a extra setting.

			// 		//grab onLevel, level, rampRate.
			// 		//infer online, on.
			// 		// gw.onLevel(data.settings.devID, function(err, result){
			// 		// 	state.settings.onLevel = result;
			// 		// 	successCount++
			// 		// 	if (successCount === 4) {
			// 		// 		gw.close();
			// 		// 		console.timeEnd("insteonLightSwitch" + data.settings.devID);
			// 		// 		cb(state);
			// 		// 	}
			// 		// });
			// 		// gw.rampRate(data.settings.devID, function(err, result){
			// 		// 	state.settings.rampRate = result;
			// 		// 	successCount++
			// 		// 	if (successCount === 4) {
			// 		// 		gw.close();
			// 		// 		console.timeEnd("insteonLightSwitch" + data.settings.devID);
			// 		// 		cb(state);
			// 		// 	}
			// 		// });
			// 		data.local.gw.level(data.settings.devID, function(err, result){
			// 			state.level = result;
			// 			if (result <= 3) {
			// 				state.on = false;
			// 			} else {
			// 				state.on = true;
			// 			}

			// 			if (!!err) {
			// 				console.log("ERROOOOORRRRR!!", err);
			// 			};
						
			// 			//successCount++
			// 			//if (successCount === 4) {
			// 				data.local.gw.close();
							
			// 				/*
			// 				console.timeEnd("insteonLightSwitch" + data.settings.devID);
			// 				*/

			// 				cb(state);
			// 			//}

			// 			/*if (result === 0 && truelyOff >= 2) {

			// 			} else {

			// 			}*/
			// 		});
			// 	})
			// } catch (e) {
				
			// }
		} else if (data.designRef === "sonosSpeaker") {
			var device = new sonos.Sonos(data.settings.ip, data.settings.port);
			//console.log("SONOS ASK\n", data, device);
			var state = {};
			state.online = true;
			//current data
			device.currentTrack(function(err, result){
				console.log("SONOS TRACK\n", result);
				state.song = result;
				//volume
				device.getVolume(function(err, result){
					state.volume = result;
						device.currentState(function(err, result){
							//console.log("TEST",result);
							if (!!result) {
								state.playing = result;
							};
							device.getMusicLibrary('playlists', {start: '0', total: '100'}, function(err, result){
								if (!!result) {
									//console.log(result);
									state.playlists = result.items;
								}	
								//return /* online playing song queue (list) volume 	*/
								cb(state);
							});
							
						});
				})
			});
		} else if (data.type === "Pebble") {

		}
	}

	this.destroy = function() {
		clearInterval(data.settings.process);
		//delete this; ... somehow ... pop from Collection Mob?
	}
	this.getID = function() {
		return data.id;
	}

	
};

var Mob = function() {
	//add
	//destroy
	//find
	var collection = []
	this.add = function(element) {
		collection.push(element);
		return collection;
	}
	this.destroy = function(id) {
		for (var i = 0; i < collection.length; i++) {
			if (!!collection[i].id && collection[i].id === id) {
				//console.log("FOUND");
				//found++;
				collection.splice(i, 1);
				return collection;
			} else if(!!collection[i].getID && collection[i].getID()=== id) {
				console.log("DESTROY");
				//found++;
				collection.splice(i, 1);
				console.log("AFTER DESTROY", collection);
				return collection;

			}

			var index = collection
		};
	}
	this.find = function (id, cb) {
		var found = 0;
		for (var i = 0; i < collection.length; i++) {
			if (!!collection[i].id && collection[i].id === id) {
				//console.log("FOUND");
				found++;
				cb(collection[i]);
			} else if(!!collection[i].getID && collection[i].getID()=== id) {
				console.log("FOUND");
				found++;
				cb(collection[i]);

			}
		};
		if (found === 0) {
			cb(null, "404");
		};
		
	}

}

module.exports = {
	Mob: Mob,
	Shouter: Shouter
}
