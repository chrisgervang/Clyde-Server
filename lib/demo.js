var WeMo = require('./devices/motion');

var config = require('./config').config;
var Action = require('./Action');

var hueIP = "192.168.1.89";


var client = WeMo.Search();
client.on('found', function(dev) {
	console.log(dev.ip, dev.port, dev.friendlyName);
	if (dev.friendlyName.toString() === 'WeMo Motion') {
		var wemo_motion = new WeMo.Motion({ip: dev.ip, port: dev.port});
		wemo_motion.init("slient");

		wemo_motion.on('motion', function() {
			config = require('./config').config
			if (config === 'one') {

			} else if (config === 'two') {

			} else if (config === 'three') {
				wemo_lightswitch.switchTo("on");
				Action.hue('setGroupLightState',{hostname: hueIP, username: "3a05e04e39a37c71891c16239b67beb", state: "on"});
				//add energetic playlist to on
			} else if (config === 'four') {
				Action.hue('setGroupLightState',{hostname: hueIP, username: "3a05e04e39a37c71891c16239b67beb", state: "dinner"});
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
				}, 4000)
			}
		});
	} else if(dev.friendlyName.toString() === 'WeMo Light Switch') {
		var wemo_lightswitch = new WeMo.Switch({ip: dev.ip, port: dev.port});
		wemo_lightswitch.init("slient");


		wemo_lightswitch.on('on', function(){
			config = require('./config').config
			if (config === 'zero') {
				Action.hue('setGroupLightState',{hostname: hueIP, username: "3a05e04e39a37c71891c16239b67beb", state: "off"});
			} else if (config === 'one') {

			} else if (config === 'two') {
				Action.hue('setGroupLightState',{hostname: hueIP, username: "3a05e04e39a37c71891c16239b67beb", state: "on"});
			} else if (config === 'three') {
				
			} else if (config === 'four') {

			} else if (config === 'five') {

			}
			console.log("switch is now on", config);
		});

		wemo_lightswitch.on('off', function(){
			config = require('./config').config
			if (config === 'zero') {
				//Action.hue('setGroupLightState',{hostname: hueIP, username: "3a05e04e39a37c71891c16239b67beb", state: "off"});
			} else if (config === 'one') {

			} else if (config === 'two') {
				Action.hue('setGroupLightState',{hostname: hueIP, username: "3a05e04e39a37c71891c16239b67beb", state: "off"});
			} else if (config === 'three') {
				//back up to reset
				Action.hue('setGroupLightState',{hostname: hueIP, username: "3a05e04e39a37c71891c16239b67beb", state: "off"});
				//turn off music
			} else if (config === 'four') {

			} else if (config === 'five') {

			}
			console.log("switch is now off", config);
			
		});
	}
 });

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