var WeMo = require('./devices/motion');

/*var wemo_lightswitch = new WeMo.Switch({ip: '10.0.1.122', port: 49153});
wemo_lightswitch.init();

wemo_lightswitch.on('on', function(){
	console.log("Switch On")
});

wemo_lightswitch.on('off', function(){
	console.log("Switch Off")
});


var wemo_motion = new WeMo.Motion({ip: '10.0.1.121', port: 49152});
wemo_motion.init();

wemo_motion.on('motion', function() {
	console.log("There be motion!");
	wemo_lightswitch.switchTo("on");
});

wemo_motion.on('stillness', function() {
	console.log("No Motion");
	wemo_lightswitch.switchTo("off");
});*/

/*
wemo_motion.status(function(result){
	console.log(result);
});*/




//////////////////////////////////DEMO TIME/////////
/*


*/
var wemo_lightswitch = new WeMo.Switch({ip: '10.0.1.122', port: 49153});
wemo_lightswitch.init();

wemo_lightswitch.on('on', function(){
	Action.hue('setGroupLightState',{hostname: '192.168.2.7', username: "3a05e04e39a37c71891c16239b67beb", state: "on"});
});

wemo_lightswitch.on('off', function(){
	Action.hue('setGroupLightState',{hostname: '192.168.2.7', username: "3a05e04e39a37c71891c16239b67beb", state: "off"});
});





//handling error - auto retry
//handling connection - auto find and connection
//handling 


//server ready state and working state - temporary brute hack this, but more or less the idea is to rate limit each device so that we don't ever interact with a device within a time between the last request or within the device is "ready"