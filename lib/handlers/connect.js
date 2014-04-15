//var WeMo = require('../devices/wemo');
var Firebase = require('firebase');
var clydedevices = new Firebase('https://clydedev.firebaseio.com/devices/');
var WeMo = new require('wemo');

var connect = function(request, reply) {

	var device = request.payload.device;
	/*{
		"userId":
		"type":
		"device": {
			"idOfSorts"
		}
	}*/
	console.log(device);


	var newDev = clydedevices.push(device, function(err){
		newDev.update({uuid: newDev.name()}, function(err){
			newDev.on('value', function(snapshot){

				var shout = new Shouter({uuid: snapshot.val().uuid});

				reply(snapshot.val()).code(200);
			});
		});
	});

}


module.exports = connect;


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
		//uuid: String*
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
	console.log(config.uuid);
	data.uuid = config.uuid;

	var device = new Firebase('https://clydedev.firebaseio.com/devices/'+data.uuid);
	device.once("value", function(result){
		
		data = result.val();
		console.log("DATATATATA", data);
			//fill in data from Device Desighn Doc here. Based off data.type
		//validation here... write a helper funtion for grabbing from firebase + validation... called Umpire.getDevice({uuid},func...)
		
		if (data.type === "WeMo LightSwitch") {
			//TODO: connect a WeMo and finish WeMo Switch & LightSwitch
			var client = WeMo.Search();
			client.on('found', function(result){
				if (result.friendlyName.toString() === 'WeMo LightSwitch' && !data.type) {
					data.type = 'WeMo LightSwitch';
					data.macAddress = result.macAddress.toString();
					data.device.ip = result.ip;
					data.device.port = result.port;
					data.device.online = true;
					//Sculley: New Connection
					//Firebase: Post up the new device for the User
				}
			});
		} else if (data.type === "WeMo Motion") {
			var client = WeMo.Search();
			var that = this;
			client.on('found', function(result){
				//console.log(result, result.deviceType.toString() === 'urn:Belkin:device:sensor:1', !data.macAddress, data);
				if (result.deviceType.toString() === 'urn:Belkin:device:sensor:1' && !data.macAddress) {
					data.type = 'WeMo Motion';
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
		} else if (data.type === "WeMo Switch") {

		} else if (data.type === "SparkCore") {

		} else if (data.type === "Philips Hue") {

		} else if (data.type === "Sonos") {

		} else if (data.type === "Pebble") {

		}

	});

	//separate as function so we can start a loop on the fly.
	this.init = function() {
		if (!data.device.state) {
			data.device.state = {};
		}

		if (data.type === "WeMo LightSwitch") {
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
		} else if (data.type === "WeMo Motion") {
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
		} else if (data.type === "WeMo Switch") {
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
		} else if (data.type === "SparkCore") {

		} else if (data.type === "Philips Hue") {

		} else if (data.type === "Sonos") {

		} else if (data.type === "Pebble") {

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
		} else if (data.type === "WeMo Switch") {
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

}

var shout = new Shouter({uuid: "-JKTpBNIA9Uss4b38LDU"});

	setTimeout(function() {
		console.log(shout);
		shout.destroy();
		console.log(shout);
	}, 10000);
