var wemo = require('./devices/wemo');

var wemo_motion = wemo.wemo_motion;
var wemo_lightswitch = wemo.wemo_lightswitch;

wemo_lightswitch.init({ip: '192.168.1.95', port: 49153});

// wemo_lightswitch.on('on', function(){
// 	console.log("ONNNNNN")
// });

// wemo_motion.init({ip: '192.168.1.78', port: 49153});

// wemo_motion.on('motion', function() {
// 	wemo_lightswitch.on();
// });

// wemo_motion.on('stillness', function() {
// 	wemo_lightswitch.off();
// });
