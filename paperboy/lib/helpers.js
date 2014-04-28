var Firebase = require('firebase');
var clydedevices = new Firebase('https://clydedev.firebaseio.com/devices/');
var deviceDesignDB = new Firebase('https://clydedev.firebaseio.com/deviceDesigns/');
var _ = require('lodash');
var db = require('./db');


//Device API's
var sonos = require('sonos');
var WeMo = new require('wemo');
var Action = require('./Action');


//Init Device DB helper
var devices = new db("devices");

devices.load(function(devices){
	var initDevices = new Mob();
	//console.log(devices);
	devices.forEach(function(device, index, array){
		initDevices.add(new Shouter({id: device.id}));
	})
});





//Shouter Rules
	//At very minimum, a shouter needs a 'uuid' & 'userid' to be created and a 'type' to actually run. 
	//If the 'type' search doesn't come back with anything after some time, then an error is thrown saying "Tried to create a Shouter for a [device], user: [userid]". 
	//If 'uuid' || 'userid' doesn't exist, also throw an error "The user or device doesn't exist"
var Shouter = function(config) {
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

	
	data.id = config.id;
	var that = this;
	var device = new Firebase('https://clydedev.firebaseio.com/devices/'+data.id);
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
				console.log("SONOS",device);
			  device.deviceDescription(function(err, details){
			  	console.log("SONOS",device);
			  	if (details.serialNum === data.settings.serialNum && !data.settings.UDN) {
			  		console.log("SONOS",device);
			  		data.settings.ip = device.host;
			  		data.settings.port = device.port;
			  		data.settings.online = true;
			  		data.settings.UDN = details.UDN;
			  		data.settings.modelName = details.modelName;

			  		console.log(that,data);
					//Sculley: New Connection
					//Firebase: Post up the new device for the User
					new Firebase("https://clydedev.firebaseio.com/devices/" + data.id).update({settings: data.settings})
					that.init();
			  	} else if (details.serialNum === data.settings.serialNum) {
			  		that.init()
			  	}
			  });
			});



		} else if (data.designRef === "Pebble") {

		}

	});

	//separate as function so we can start a loop on the fly.
	this.init = function() {
		if (!data.state) {
			data.state = {};
		}
		var that = this;
		data.settings.pollRate = 1000;

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

		} else if (data.designRef === "sonosSpeaker") {
			console.log("INIT SONOS");
			data.settings.process = setInterval(function(){

				that.ask(function(result) {

					//console.log("DATA STATE\n", data.state);
					//is this device online
					if (data.state.online !== result.online) {
						// Sculley: data change
						console.log("SONOS CHANGE: ONLINE.", result.online);
						data.state.online = (result.online ? true : false);
						//Firebase: Post up the device... maybe Catcher event!
						new Firebase("https://clydedev.firebaseio.com/devices/" + data.id + "/state/").update({online: data.state.online})
					}
					//is this device playing
					if (data.state.playing !== result.playing && !!result.playing) {
						// Sculley: data change
						console.log("SONOS CHANGE: PLAYING.", result.playing);
						data.state.playing = result.playing;
						//Firebase: Post up the device... maybe Catcher event!
						new Firebase("https://clydedev.firebaseio.com/devices/" + data.id + "/state/").update({playing: data.state.playing})
					}
					//the play queue
					if (data.state.queue === "_temp" || _.difference(data.state.queue, result.queue).length !== 0) {
						// Sculley: data change
						console.log("SONOS CHANGE: QUEUE.", result.queue);
						data.state.queue = result.queue;
						//Firebase: Post up the device... maybe Catcher event!
						new Firebase("https://clydedev.firebaseio.com/devices/" + data.id + "/state/").update({queue: data.state.queue})
					}
					//current playing song
					if (!data.state.song || data.state.song.artist !== result.song.artist || data.state.song.title !== result.song.title || data.state.song.album !== result.song.album) {
						// Sculley: data change
						console.log("SONOS CHANGE: SONG.", result.song);
						data.state.song = result.song;
						//Firebase: Post up the device... maybe Catcher event!
						new Firebase("https://clydedev.firebaseio.com/devices/" + data.id + "/state/").update({song: data.state.song})
					}
					//the current volume
					if (data.state.volume !== result.volume) {
						// Sculley: data change
						console.log("SONOS CHANGE: VOLUME.", result.volume);
						data.state.volume = result.volume;
						//Firebase: Post up the device... maybe Catcher event!
						new Firebase("https://clydedev.firebaseio.com/devices/" + data.id + "/state/").update({volume: data.state.volume})
					}
					
				});
			}, data.settings.pollRate);
			console.log(data.settings.process)

			var processDB = new Firebase("https://clydedev.firebaseio.com/devices/" + data.id + "/settings/");
			processDB.update({pollRate: data.settings.pollRate});
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
		} else if (data.type === "SparkCore") {

		} else if (data.type === "Philips Hue") {

		} else if (data.designRef === "sonosSpeaker") {
			var device = new sonos.Sonos(data.settings.ip, data.settings.port);
			//console.log("SONOS ASK\n", data, device);
			var state = {};
			state.online = true;
			//current data
			device.currentTrack(function(err, result){
				//console.log("SONOS TRACK\n", result);
				state.song = result;
				//volume
				device.getVolume(function(err, result){
					state.volume = result;
					//queue of 100 songs 
					device.getMusicLibrary('tracks', {start: 0, total: 100}, function(err, result){
						
						state.queue = result.items;
						device.currentState(function(err, result){
							//console.log("TEST",result);
							if (!!result) {
								state.playing = result;
							};
							//return /* online playing song queue (list) volume 	*/
							cb(state);
						})
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
		collection.forEach(function(device, index, array){
			if (device.id === id) {
				collection = collection.splice(index, 1);
				return collection;
			}
		});
	}
	this.find = function (id, cb) {
		collection.forEach(function(device, index, array){
			if (device.id === id) {
				cb(collection);
			}
		});
	}

}

var Catcher = function() {
	var chunkDB = new Firebase('https://clydedev.firebaseio.com/blocks/');
	var chunks;

}