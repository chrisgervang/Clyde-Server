var WeMo = require('./devices/motion'),
	// WeMo_s = require('./devices/switch');
	nano    = require('nano')('http://localhost:5984');


var wemo_lightswitch = new WeMo.Switch({ip: '10.0.1.122', port: 49153});
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
});


/*
wemo_motion.status(function(result){
	console.log(result);
});*/