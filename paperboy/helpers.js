var Firebase = require('firebase');
var clydedevices = new Firebase('https://clydedev.firebaseio.com/devices/');
var WeMo = new require('wemo');
var deviceDesignDB = new Firebase('https://clydedev.firebaseio.com/deviceDesigns/');
var _ = require('lodash');
var Action = require('../Action');


var loadDB = function(root, cb){
	var deviceDB = new Firebase('https://clydedev.firebaseio.com/' + root + "/");
	
	var devices = [];
	deviceDB.once('value', function(snapshot){
		//console.log(snapshot.val());
		var deviceCount = _.size(snapshot.val());
		var count = 0;
		deviceDB.on('child_added', function(snapshot){
			devices.push(snapshot.val());

			count++;
			console.log(deviceCount, count);
			if (count >= deviceCount) {
				cb(devices);
			}
		});
		
	});
}

loadDB("devices", function(devices){
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

	data.pollRate = 1000;
	console.log(config.id);
	data.id = config.id;

	var device = new Firebase('https://clydedev.firebaseio.com/devices/'+data.id);
	device.once("value", function(result){
		
		data = result.val();
		//console.log("DATATATATA", data);
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
			var that = this;
			client.on('found', function(result){
				//console.log(result, result.devicedesignRef.toString() === 'urn:Belkin:device:sensor:1', !data.macAddress, data);
				if (result.devicedesignRef.toString() === 'urn:Belkin:device:sensor:1' && !data.macAddress) {
					data.designRef = 'WeMo Motion';
					data.macAddress = result.macAddress.toString();
					data.device = {};
					data.device.ip = result.ip;
					data.device.port = result.port;
					data.device.online = true;
					console.log(data);
					//Sculley: New Connection
					//Firebase: Post up the new device for the User
					that.init();
				}
			});
		} else if (data.designRef === "wemoSwitch") {

		} else if (data.designRef === "SparkCore") {

		} else if (data.designRef === "Philips Hue") {

		} else if (data.designRef === "Sonos") {

		} else if (data.designRef === "Pebble") {

		}

	});

	//separate as function so we can start a loop on the fly.
	this.init = function() {
		if (!data.device.state) {
			data.device.state = {};
		}

		if (data.designRef === "WeMo LightSwitch") {
			data.process = setInterval(function(){
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
			}, data.pollRate);
		} else if (data.designRef === "WeMo Motion") {
			var that = this;
			data.process = setInterval(function(){
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
			}, data.pollRate);
		} else if (data.designRef === "wemoSwitch") {
			data.process = setInterval(function(){
				that.ask(function(result) {
					if (data.device.state.on !== result) {
						// Sculley: data change
						data.device.state = {
							on: (result ? true : false)
						}
					}
				});
			}, data.pollRate);
		} else if (data.designRef === "SparkCore") {

		} else if (data.designRef === "Philips Hue") {

		} else if (data.designRef === "Sonos") {

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

		} else if (data.type === "Sonos") {

		} else if (data.type === "Pebble") {

		}
	}

	this.destroy = function() {
		clearInterval(data.process);
		//delete this; ... somehow ... pop form Collection Mob?
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