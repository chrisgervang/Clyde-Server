//POST to /device to pass a command to make a device do something
//POST to /group to pass a command to a group of devices to do something

//based off devices in Firebase. SO the POST JSON looks like:

/*{
	"id":"firebaseID",
	"action": {
		"data":
		"method":
	}
}*/

//from ID, expand all device data from firebase. use this to command a "Action"

var Firebase = require('firebase');
var db = require('../lib/db');
var helpers = require('../lib/helpers');

//Init Device DB helper
var devices = new db("devices");

var sonos = require('sonos');
var _ = require('lodash');


var command = function(request, reply) {
	var data = request.payload.command;
	console.log("DATA", data);
	console.time("light");
	//Device Firebase improvement:
	//ok so for commands I am going initailize a Souter.ask() so that we can get up to date data right away.
	//BOOM.
	//This also means the remote will cause chunks to fire if a chunk uses the remote controlled device as a trigger.

	devices.load(function(elements){
		var group = [];
		console.log(elements.length, data.id.length);
		for (var i = 0; i < elements.length; i++) {
			for (var j = 0; j < data.id.length; j++) {
				if (elements[i].id === data.id[j]) {
					group.push(elements[i]);
				}
			}
		}
		//console.log("HERES UR BATCH", group);
		
		if (group[0].designRef === 'insteonLightSwitch') {
			var Insteon = require('../../../home-controller').Insteon;
			var gw = new Insteon();
			gw.connect(group[0].settings.hubIp, function(){
				var successCount = 0;
				for (var i = 0; i < group.length; i++) {
					if (!!group[i].settings.devID) {
						var device = group[i];
						console.log("insteonLightSwitch COMMAND", group[i].settings.devID, data.data.level)
						insteon(gw, group[i], data, function(result) {
							console.log("finished", result);
							//update firebase with a shouter!
							new helpers.Shouter({id: device.id, onDemand: true});
							successCount++;
							if (successCount === group.length) {
								gw.close();
								reply("SUCCESS").code(200);
							}
						});
					}
				};
			});
		} else if(group[0].designRef === 'sonosSpeaker') {
			var successCount = 0;
			for (var i = 0; i < group.length; i++) {
				var device = new sonos.Sonos(group[i].settings.ip, group[i].settings.port);
				//for scope sake!
				var deviceDBref = group[i];
				if (data.func === 'play') {
					device.play(function(){
						successCount++;
						//update firebase with a shouter!
						new helpers.Shouter({id: deviceDBref.id, onDemand: true})
						if (successCount === group.length) {
							reply("SUCCESS").code(200);
						}
					});
				} else if(data.func === 'pause') {
					device.pause(function(){
						successCount++;
						//update firebase with a shouter!
						new helpers.Shouter({id: deviceDBref.id, onDemand: true})
						if (successCount === group.length) {
							reply("SUCCESS").code(200);
						}
					});
				} else if(data.func === 'speakerTextToSpeech') {
					//Replace all spaces with a _ because Sonos doesn't support spaces
					var setInputText = _.find(data.data, {dataType: "setInputText"})
					var text = setInputText.dataValue.replace(/ /g,'_');

					//For supported languages see www.voicerss.org/api/documentation.aspx
					//This url just redirects to voicerss because of the specific url format for the sonos
					var url = 'http://i872953.iris.fhict.nl/speech/en-uk_' + encodeURIComponent(text)+'.mp3';
					console.log(url);
					device.queueNext(url, function(err, playing) {
					  	successCount++;
						//update firebase with a shouter!
						new helpers.Shouter({id: deviceDBref.id, onDemand: true})
						if (successCount === group.length) {
							reply("SUCCESS").code(200);
						}
					});
				} else if(data.func === 'stop') {
					device.stop(function(){
						successCount++;
						//update firebase with a shouter!
						new helpers.Shouter({id: deviceDBref.id, onDemand: true})
						if (successCount === group.length) {
							reply("SUCCESS").code(200);
						}
					});
				} else if(data.func === 'setVolume') {
					device.setVolume(data.data.volume, function(){
						successCount++;
						//update firebase with a shouter!
						new helpers.Shouter({id: deviceDBref.id, onDemand: true})
						if (successCount === group.length) {
							reply("SUCCESS").code(200);
						}
					});
				} else if(data.func === 'queueSpotify') {
					device.queueSpotify(data.data.uri, function(result, error){
						console.log(result, error);
						successCount++;
						//update firebase with a shouter!
						new helpers.Shouter({id: deviceDBref.id, onDemand: true})
						if (successCount === group.length) {
							reply("SUCCESS").code(200);
						}
					})
				}
			};
		}


	});


	//insteon
	var insteon = function(gw, device, data, cb) {
		console.time("light");
		setTimeout(function(){
			if (data.func === "turnOnFast") {
				gw.turnOnFast(device.settings.devID, function(error, result) {
					//console.log(error, result);
	
					console.timeEnd("light");
					cb(result);

				});
			} else if (data.func === "turnOn") {
				gw.turnOn(device.settings.devID, data.data.level, data.data.rampRate, function(error, result) {
					//console.log(error, result);
	
					console.timeEnd("light");
					cb(result);

				});
			} else if (data.func === "lightSwitchState") {
				var setIfBoolean = _.find(data.data, {dataType: "setIfBoolean"});
				if (setIfBoolean.dataValue === true) {
					gw.turnOnFast(device.settings.devID, function(error, result) {
						//console.log(error, result);
		
						console.timeEnd("light");
						cb(result);

					});
				} else if (setIfBoolean.dataValue === false) {
					gw.turnOffFast(device.settings.devID, function(error, result) {
						//console.log(error, result);
		
						console.timeEnd("light");
						cb(result);

					});
				}
			} else if (data.func === "turnOff") {
				gw.turnOff(device.settings.devID, data.data.rampRate, function(error, result) {
					//console.log(error, result);
	
					console.timeEnd("light");
					cb(result);

				});
			} else if(data.func === "turnOffFast") {
				gw.turnOffFast(device.settings.devID, function(error, result) {
					//console.log(error, result);
	
					console.timeEnd("light");
					cb(result);
				});
			} else if(data.func === "setLevel") {
				if (!!data.data.level || data.data.level === 0) {
					gw.level(device.settings.devID, data.data.level, function(error, result){
						//console.log(error, result); // Should print 50
		
						console.timeEnd("light");
						cb(result);
					});
				}
			} else if(data.func === "getLevel") {
				gw.level(device.settings.devID, function(error, result){
					//console.log(error, result); // Should print 50
	
					console.timeEnd("light");
					cb(result);
				});
			} else if(data.func === "getDeviceInfo") {
				gw.info(device.settings.devID, function(error, result){
					//console.log(error, result); // Should print 50
	
					console.timeEnd("light");
					cb(result);
				});
			} else if(data.func === "linkDevice") {
				//HALF BROKEN... throws error, kills server, after a link is made.
				gw.link('gw', [device.settings.devID], function(error, link) {
				  // link data from gateway
				    //console.log(error, link);
				
					console.timeEnd("light");
					cb(link);
				});
			} else if(data.func === "getLinks") {
				gw.links(function(error, result){
					//console.log(error, result);
	
					console.timeEnd("light");
					cb(result);
				});
			} else if(data.func === "unlinkDevice") {
				//HALF BROKEN... throws error, kills server, after a link is made.
				gw.unlink('gw', [device.settings.devID], function(error, link) {
				  // link data from gateway
				    console.log(error, link);
				
					console.timeEnd("light");
					cb(link);
				});
			}
			//BROKEN
			// gw.turnOff(data.settings.devID, 3000, function(error, result) {
			// 	console.log(error, result);
			// });
		}, 0);
	}

	/*if (request.params.type === "device") {
		//grab {obj} of all devices. the firebase ID is the key. Note: this is not an array.
		devices.root.once('value', function(snapshot){
			var devices = snapshot.val();
			if(!!devices[data.id]){
				var device = devices[data.id];
				console.log("FOUND DEVICE", devices[data.id]);
				console.log("BIG DATA!", group[i]);
				//insteon
				if (device.designRef === 'insteonLightSwitch') {
					var Insteon = require('home-controller').Insteon;
					var gw = new Insteon();
					gw.connect(device.settings.hubIp, function(){
						console.log("insteonLightSwitch COMMAND", device.settings.devID, data.data.level)
						if (!!device.settings.devID) {
							console.log('Connected!');
							insteon(gw, device, data, function(result) {
								console.log("finished", result.command.id);
								gw.close();
								reply(result).code(200);
							});
						}
					});
				}
			}
		})
	}*/
}

module.exports = command;
