var Pebble  = require('./devices/pebble');
var pebble = new Pebble.Watch();


var Trigger = {
	pebbleButton: function(name){
		pebble.buttonPress(name);
	},
	on: function (device, cb) {
		if (device == "pebble") {
			pebble.on('dinner', function(){
				cb('dinner');
			})
		}
	}

}

module.exports = Trigger
