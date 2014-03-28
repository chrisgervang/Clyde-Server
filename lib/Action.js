var spark = require('sparknode');
var HueApi = require("node-hue-api").HueApi,
    LightState = require("node-hue-api").lightState;
    //addHueser = require("node-hue-api").addUser;

var Action = {
	spark: function(method, data) {
		console.log(data);
		var core = new spark.Core(data.accessToken, data.deviceID);
		
		core[data.func](data.params, function(err, data) {
			console.log(data);
		});
	},
	hue: function(method, data) {
		hue = new HueApi(data.hostname, data.username);
		// console.log(require("node-hue-api"));
		hue.groups(function(err, config) {
		    if (err) throw err;
		    console.log(config);
		});

		var states = {
		    rainy: LightState.create().on().rgb(0, 0, 255).brightness(80),
		    cold: LightState.create().on().rgb(255,0,0).brightness(80),
		    sunny: LightState.create().on().white(500, 80),
		    off: LightState.create().off(),
		    on: LightState.create().on().white(400, 90).transition(2).white(154, 50)
		};

		var hueState = false;

		hue.setGroupLightState(0, states[data.state], function(err, result) {
		    if (err) throw err;
		    	console.log(result);
		});
	}
}
module.exports = Action;