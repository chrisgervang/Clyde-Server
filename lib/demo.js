var WeMo = require('./devices/wemo');
console.log(WeMo);
var config = require('./config').config;
var Action = require('./Action.js'),
	Trigger = require('./Trigger.js');

var hueIP = "192.168.1.89";

var Sonos = require('sonos').Sonos;
var sonos = new Sonos(process.env.SONOS_HOST || '192.168.1.110', process.env.SONOS_PORT || 1400);
var assets = "http://192.168.1.74:8000";

var client = WeMo.Search();

var lightScope = {};
client.on('found', function(dev) {
	//console.log(dev, dev.serviceList.service);
	// console.log(dev.ip, dev.port, dev.friendlyName);
	if (dev.deviceType.toString() === 'urn:Belkin:device:sensor:1') {
		var wemo_motion = new WeMo.Motion({ip: dev.ip, port: dev.port});
		wemo_motion.init("slient");

		wemo_motion.on('motion', function() {
			config = require('./config').config
			if (config === 'one') {

			} else if (config === 'two') {
				
			} else if (config === 'three') {
				console.log(lightScope);
				lightScope.switchTo("on");
			} else if (config === 'four') {
				
			} else if (config === 'five') {
				Action.hue('setGroupLightState',{hostname: hueIP, username: "3a05e04e39a37c71891c16239b67beb", state: "night"});
			}
			console.log(config);
			console.log("There be motion!");
			
		});

		wemo_motion.on('stillness', function(){
			if (config === 'five') {
				setTimeout(function(){
					wemo_motion.status(function(data){
						if (data.state === 'stillness') {
							Action.hue('setGroupLightState',{hostname: hueIP, username: "3a05e04e39a37c71891c16239b67beb", state: "off"});
						}	
					})
				}, 500)
			}
		});
	} else if(dev.friendlyName.toString() === 'WeMo Light Switch') {
		var wemo_lightswitch = new WeMo.Switch({ip: dev.ip, port: dev.port});
		wemo_lightswitch.init("slient");
		lightScope = wemo_lightswitch;

		wemo_lightswitch.on('on', function(){
			config = require('./config').config
			if (config === 'zero') {
				Action.hue('setGroupLightState',{hostname: hueIP, username: "3a05e04e39a37c71891c16239b67beb", state: "off"});
			} else if (config === 'one') {

			} else if (config === 'two') {
				
			} else if (config === 'three') {
				
			} else if (config === 'four') {

			} else if (config === 'five') {

			}
			console.log("switch is now on", config);
		});

		wemo_lightswitch.on('off', function(){
			config = require('./config').config
			if (config === 'zero') {
				
			} else if (config === 'one') {

			} else if (config === 'two') {
				
			} else if (config === 'three') {
				
			} else if (config === 'four') {

			} else if (config === 'five') {

			}
			console.log("switch is now off", config);
			
		});

		Trigger.on('pebble', function(e){
			config = require('./config').config
			console.log("pebble event!!!", config, e);
			if (config === 'four' && e === 'sleep') {
				Action.hue('setGroupLightState',{hostname: hueIP, username: "3a05e04e39a37c71891c16239b67beb", state: "off"});
				wemo_lightswitch.switchTo("off");
				fade(40, 0, function() {
					sonos.pause(function(err, playing) {
				        console.log("four", err, playing);
				    });
				})
				
			}
		});
	}
 });


//NOT A COMPETE METHOD. only fades down.
var fade = function(from, to, cb) {
    setTimeout(function(){
        sonos.setVolume("" + from, function(err, data){
            console.log(data, err);
            if (from <= to) {
                console.log("DONE", from);
                cb();
            } else {
                from--;
                fade(from, to, cb);
            }
        });
    },10);
};


//////////////////////////////////DEMO TIME/////////
/*


*/
// pebble.on('dinner', function(){
// 	config = require('./config').config;
// 	if (config === 'zero') {
// 		Action.hue('setGroupLightState',{hostname: hueIP, username: "3a05e04e39a37c71891c16239b67beb", state: "off"});
// 		wemo_lightswitch.switchTo("off");
// 		//stop all music
// 	} else if (config === 'four') {
// 		Action.hue('setGroupLightState',{hostname: hueIP, username: "3a05e04e39a37c71891c16239b67beb", state: "purple"});
// 		wemo_lightswitch.switchTo("off");
// 	}
// });



//handling error - auto retry
//handling connection - auto find and connection
//handling 


//server ready state and working state - temporary brute hack this, but more or less the idea is to rate limit each device so that we don't ever interact with a device within a time between the last request or within the device is "ready"