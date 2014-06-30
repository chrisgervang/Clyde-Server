var sonos = require('sonos');
var spark = require('sparknode');
var HueApiRequire = require("node-hue-api"),
	HueApi = HueApiRequire.HueApi,
    LightState = HueApiRequire.lightState;

var assets = "http://192.168.1.74:8000";

var _ = require('lodash');

var devices = {
	sonos: {
		ip: "192.168.1.101",
		port: 1400,
		assets: "http://192.168.1.150:8000/"
	},
	hue: {
		username: "359bca06388d1c041eb8fa523fae0ff",
		ip: "192.168.1.135",
		hubId: "001788fffe105c5b"
	},
	spark: {
		deviceId: "53ff6c065067544829381287",
		accessToken: "3834a3ae871ea528e0eb03865a91df9ad76313db"
	}
}

var color = require('./color');
console.log(color);

var states = {
	hue: {
		right: "off",
		left: "off"
	},
	spark: {
		led: "off",
		water: "off",
		curtain: "close"
	}
}

var lightStates = {
    off: LightState.create().off().effect('none'),
    on: LightState.create().on().white(400, 70).effect('none'),
    party: LightState.create().on().effect('colorloop')
};

var getConfigs = function() {
	var client = sonos.search();
	client.on('DeviceAvailable', function(device, model) {
	  device.deviceDescription(function(err, details){
	  	console.log("SONOS",details);
	  });
	});

	//http://www.meethue.com/api/nupnp
	HueApiRequire.locateBridges(function(err, result) {
	    if (err) throw err;
	    displayBridges(result);
	});
	var displayBridges = function(bridge) {
	    console.log("Hue Bridges Found: " + JSON.stringify(bridge));
	};
	// var hue = new HueApi(devices.hue.ip, devices.hue.username);
	// hue.createUser(devices.hue.ip, null, null, function(err, user) {
	//     if (err) throw err;
	//     displayUserResult(user);
	// });
	// var displayUserResult = function(result) {
	//     console.log("Created user: " + JSON.stringify(result));
	// };
}

//getConfigs();
// var hue = new HueApi(devices.hue.ip, devices.hue.username);
// hue.lights(function(err, lights) {
//    if (err) throw err;
//    displayResult(lights);
// });


var command = function(request, reply) {
	var data = request.payload.command;
	//console.log("DATA", data);
	console.log(1)
	var displayResult = function(result) {
    	console.log(JSON.stringify(result, null, 2));
	    reply(result).code(200);
	};	
	if (data.device === "Window Curtains") {
		var core = new spark.Core(devices.spark.accessToken,devices.spark.deviceId);
		
		core.on('connect', function() {
			console.log(core);
			if (data.func === "curtainState") {
				if (data.data.data === "open") {
					core.curtain("open", function(err, data){
						console.log(err, data);
						states.spark.curtain = "open";
					});
				} else if (data.data.data === "close") {
					core.curtain('close', function(err, data){
						console.log(err, data);
						states.spark.curtain = "close";
					});
				}
			} else if (data.func === "curtainToggle") {
				if (states.spark.curtain === "open") {
					core.curtain("close", function(err, data){
						console.log(err, data);
						states.spark.curtain = "close";
					});
				} else if (states.spark.curtain === "close") {
					core.curtain("open", function(err, data){
						console.log(err, data);
						states.spark.curtain = "open";
					});
				}
			}
		});
	} else if (data.device === "Desk Fountain") {
		var core = new spark.Core(devices.spark.accessToken,devices.spark.deviceId);
		core.on('connect', function() {
			if (data.func === "fountainState") {
				if (data.data.data === "on") {
					core.fountain('on', function(err, data){
						console.log(err, data);
						states.spark.water = "on";
					});
				} else if (data.data.data === "off") {
					core.fountain('off', function(err, data){
						console.log(err, data);
						states.spark.water = "off";
					});
				}
			} else if (data.func === "fountainToggle") {
				if (states.spark.water === "on") {
					core.fountain('off', function(err, data){
						console.log(err, data);
						states.spark.water = "off";
					});
				} else if (states.spark.water === "off") {
					core.fountain('on', function(err, data){
						console.log(err, data);
						states.spark.water = "on";
					});
				}
			}
		});
	} else if (data.device === "Sonos Speaker") {
		var device = new sonos.Sonos(devices.sonos.ip, devices.sonos.port);
		if (data.func === "speakerTts") {
			if (data.data.data === "PebbleSparkClyde") {
				device.setVolume(80, function(){
					device.queueNext(devices.sonos.assets+"pebblesparkclyde.mp3", function(err, result){
						device.play(function(){
							console.log(err, result);
							reply([err,result]).code(200);
						});
						
					});
				});
			} else if (data.data.data === "Hello") {
				device.setVolume(80, function(){
					device.queueNext(devices.sonos.assets+"hello.mp3", function(err, result){
						device.play(function(){
							console.log(err, result);
							reply([err,result]).code(200);
						});
						
					});
				});
			} else if (data.data.data === "Amazon") {
				device.setVolume(80, function(){
					device.queueNext(devices.sonos.assets+"amazon.mp3", function(err, result){
						device.play(function(){
							console.log(err, result);
							reply([err,result]).code(200);
						});
						
					});
				});
			} else if (data.data.data === "Email") {
				device.setVolume(80, function(){
					device.queueNext(devices.sonos.assets+"email.mp3", function(err, result){
						device.play(function(){
							console.log(err, result);
							reply([err,result]).code(200);
						});
						
					});
				});
			} else if (data.data.data === "Mac") {
				device.setVolume(80, function(){
					device.queueNext(devices.sonos.assets+"mac.mp3", function(err, result){
						device.play(function(){
							console.log(err, result);
							reply([err,result]).code(200);
						});
						
					});
				});
			} else if (data.data.data === "Txt") {
				device.setVolume(80, function(){
					device.queueNext(devices.sonos.assets+"txt.mp3", function(err, result){
						device.play(function(){
							console.log(err, result);
							reply([err,result]).code(200);
						});
						
					});
				});
			} else if (data.data.data === "Nyan") {
				device.setVolume(30, function(){
					device.queueNext(devices.sonos.assets+"nyan.mp3", function(err, result){
						device.play(function(){
							console.log(err, result);
							reply([err,result]).code(200);
						});
						
					});
				});
			}
		} else if (data.func === "speakerNotification") {
			
		}
	} else if (data.device === "Window Lights") {
		var core = new spark.Core(devices.spark.accessToken,devices.spark.deviceId);
		core.on('connect', function() {
			if (data.func === "lightsState") {
				if (data.data.data === "on") {
					core.fade('255,255,255', function(err, data){
						console.log(err, data);
						states.spark.led = "on";
					});
				} else if (data.data.data === "off") {
					core.fade('0,0,0', function(err, data){
						console.log(err, data);
						states.spark.led = "off";
					});
				}
			} else if (data.func === "lightsColor") {
				core.fade(data.data.data, function(err, data){
					console.log(err, data);
					states.spark.led = "on";
				});
			} else if (data.func === "lightToggle") {
				if (states.spark.led === "on") {
					core.fade('0,0,0', function(err, data){
						console.log(err, data);
						states.spark.led = "off";
					});
				} else if (states.spark.led === "off") {
					// Returns a random integer between min and max
					// Using Math.round() will give you a non-uniform distribution!
					function getRandomInt(min, max) {
					  return Math.floor(Math.random() * (max - min + 1)) + min;
					}

					core.fade(getRandomInt(0,255)+','+getRandomInt(0,255)+',',getRandomInt(0,255), function(err, data){
						console.log(err, data);
						states.spark.led = "on";
					});
				};
			} else if (data.func === "lightEffect") {
				if (data.data.data === "party") {
					//TODO EXTRA
				}
			}
		});
	} else if (data.device === "Right Hue") {
		var hue = new HueApi(devices.hue.ip, devices.hue.username);
		if (data.func === "lightsState") {
			if (data.data.data === "on") {
				hue.setLightState(3, lightStates.on, function(err, lights) {
				    if (err) throw err;
				    displayResult(lights);
				    states.hue.right = "on";
				});
			} else if (data.data.data === "off") {
				hue.setLightState(3, lightStates.off, function(err, lights) {
				    if (err) throw err;
				    displayResult(lights);
				    states.hue.right = "off";
				});
			}
		} else if (data.func === "lightsColor") {

		} else if (data.func === "lightToggle") {
			// Returns a random number between min and max
			function getRandomArbitrary(min, max) {
			    var num = new Number(Math.random() * (max - min) + min);
				return parseFloat(num.toPrecision(3));
			}
			var xyb = color.rgbToXyBri({r: getRandomArbitrary(0,1), g: getRandomArbitrary(0,1), b: getRandomArbitrary(0,1) });
			var xybm = color.xyBriForModel(xyb, 'LCT001');
			console.log(xyb, xybm);
			if (states.hue.right === "on") {
				hue.setLightState(3, lightStates.off, function(err, lights) {
				    if (err) throw err;
				    displayResult(lights);
				    states.hue.right = "off";
				});
			} else if (states.hue.right = "off") {
				hue.setLightState(3, LightState.create().on().xy(xybm.x, xybm.y).brightness(xybm.bri*100).effect('none'), function(err, lights) {
				    if (err) throw err;
				    displayResult(lights);
				    states.hue.right = "on";
				});
			}
		} else if (data.func === "lightEffect") {
			if (data.data.data === "party") {
				hue.setLightState(3, lightStates.party, function(err, lights) {
				    if (err) throw err;
				    displayResult(lights);
				    states.hue.right = "on";
				});
			}
		}
	} else if (data.device === "Left Hue") {
		var hue = new HueApi(devices.hue.ip, devices.hue.username);
		if (data.func === "lightsState") {
			if (data.data.data === "on") {
				hue.setLightState(2, lightStates.on, function(err, lights) {
				    if (err) throw err;
				    displayResult(lights);
				    states.hue.left = "on";
				});
			} else if (data.data.data === "off") {
				hue.setLightState(2, lightStates.off, function(err, lights) {
				    if (err) throw err;
				    displayResult(lights);
				    states.hue.left = "off";
				});
			}
		} else if (data.func === "lightsColor") {
			var ar = data.data.data.split(',');
			hue.setLightState(2, LightState.create().on().rgb(ar[0],ar[1],ar[2]).effect('none'), function(err, lights) {
			    if (err) throw err;
			    displayResult(lights);
			    states.hue.left = "off";
			});
		} else if (data.func === "lightToggle") {
			// Returns a random number between min and max
			function getRandomArbitrary(min, max) {
			    var num = new Number(Math.random() * (max - min) + min);
				return parseFloat(num.toPrecision(3));
			}
			var xyb = color.rgbToXyBri({r: getRandomArbitrary(0,1), g: getRandomArbitrary(0,1), b: getRandomArbitrary(0,1) });
			var xybm = color.xyBriForModel(xyb, 'LCT001');
			console.log(xyb, xybm);
			if (states.hue.left === "on") {
				hue.setLightState(2, lightStates.off, function(err, lights) {
				    if (err) throw err;
				    displayResult(lights);
				    states.hue.left = "off";
				});
			} else if (states.hue.left = "off") {
				hue.setLightState(2, LightState.create().on().xy(xybm.x, xybm.y).brightness(xybm.bri*100).effect('none'), function(err, lights) {
				    if (err) throw err;
				    displayResult(lights);
				    states.hue.left = "on";
				});
			}
		} else if (data.func === "lightEffect") {
			if (data.data.data === "party") {
				hue.setLightState(2, lightStates.party, function(err, lights) {
				    if (err) throw err;
				    displayResult(lights);
				    states.hue.left = "on";
				});
			}
		}
	}
}

var sonosCommand = function (deviceRef, data, cb) {
	var device = new sonos.Sonos(deviceRef.settings.ip, deviceRef.settings.port);
	console.log("FUCKING SONOS", device);
	var deviceDBref = _.extend(deviceRef);

	if(data.func === 'speakerState') {
		var setSpeakerPlayPause = _.find(data.data.data, {label: "setSpeakerPlayPause"});
		if (setSpeakerPlayPause.data === 'play') {
			console.log("HMMMMM_1", deviceDBref.id);
			device.play(function(err, result){
				if (!err) {
					console.log("HMMMMM_2", deviceDBref.id);
					onceCheck(deviceDBref.id);
					cb(result);
				} else {
					console.log(err);
				}
			});
		} else if (setSpeakerPlayPause.data === 'pause') {
			device.pause(function(err, result){
				if (!err) {
					//console.log("HMMMMM_2", deviceDBref.id);
					onceCheck(deviceDBref.id);
					cb(result);
				} else {
					console.log(err);
				}
			});
		}
	} else if(data.func === 'playPlaylist') {
		var setSpeakerPlaylist = _.find(data.data.data, {label: "setSpeakerPlaylist"});
		var name = setSpeakerPlaylist.data;
		var deviceDBref = deviceRef;
		var uri = _.find(deviceDBref.state.playlists, {title: name}).uri;
		console.log("NAME", name, "URI", uri);

		device.queuePlaylist(name, uri , function(err, result){
			if (!!err) {
				console.log([err, result]);
				reply([result, err]).code(500);
			} else {
				device.seek('track', parseInt(result[0].FirstTrackNumberEnqueued[0]), function(err, result){
					device.play(function(err, result){
						if (!err) {
							//console.log("HMMMMM_2", deviceDBref.id);
							onceCheck(deviceDBref.id);
							cb(result);
						} else {
							console.log(err);
						}
					});
				});
			}
			
		});
	} else if(data.func === 'getPlaylists') {
		device.getMusicLibrary('playlists', {start: '0', total: '100'},function(err, result){
			if (!err) {
				//console.log("HMMMMM_2", deviceDBref.id);
				onceCheck(deviceDBref.id);
				cb(result);
			} else {
				console.log(err);
			}
		
		});
	} else if(data.func === 'speakerTextToSpeech') {
		//Replace all spaces with a _ because Sonos doesn't support spaces
		var setInputText = _.find(data.data.data, {label: "setInputText"})
		var text = setInputText.data.replace(/ /g,'_');

		//For supported languages see www.voicerss.org/api/documentation.aspx
		//This url just redirects to voicerss because of the specific url format for the sonos
		var url = 'http://i872953.iris.fhict.nl/speech/en-uk_' + encodeURIComponent(text)+'.mp3';
		console.log(url);
		device.queueNext(url, function(err, playing) {
		  	successCount++;
			//update firebase with a shouter!
			// new helpers.Shouter({id: deviceDBref.id, onDemand: true})
			onceCheck(deviceDBref.id);
			if (successCount === group.length) {
				reply("SUCCESS").code(200);
			}
		});
	} else if(data.func === 'stop') {
		device.stop(function(){
			successCount++;
			//update firebase with a shouter!
			// new helpers.Shouter({id: deviceDBref.id, onDemand: true})
			onceCheck(deviceDBref.id);
			if (successCount === group.length) {
				reply("SUCCESS").code(200);
			}
		});
	} else if(data.func === 'setVolume') {
		device.setVolume(data.data.data.volume, function(){
			successCount++;
			//update firebase with a shouter!
			// new helpers.Shouter({id: deviceDBref.id, onDemand: true})
			onceCheck(deviceDBref.id);
			if (successCount === group.length) {
				reply("SUCCESS").code(200);
			}
		});
	} else if(data.func === 'queueSpotify') {
		device.queueSpotify(data.data.data.uri, function(result, error){
			console.log(result, error);
			successCount++;
			//update firebase with a shouter!
			// new helpers.Shouter({id: deviceDBref.id, onDemand: true})
			onceCheck(deviceDBref.id);
			if (successCount === group.length) {
				reply("SUCCESS").code(200);
			}
		})
	}
}

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
				cb(device);
			}
		});
	}

}


module.exports = command;
