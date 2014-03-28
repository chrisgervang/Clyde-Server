/*

*/
var wemo_motion = new WeMo.Motion({ip: '10.0.1.121', port: 49152});
wemo_motion.init();

wemo_motion.on('motion', function() {
	console.log("There be motion!");
	wemo_lightswitch.switchTo("on");
	Action.hue('setGroupLightState',{hostname: '192.168.2.7', username: "3a05e04e39a37c71891c16239b67beb", state: "on"});
	//add sonos playlist to on

});