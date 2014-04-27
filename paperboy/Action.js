var spark = require('sparknode');
var HueApi = require("node-hue-api").HueApi,
    LightState = require("node-hue-api").lightState;
    //addHueser = require("node-hue-api").addUser;

var Insteon = require('home-controller').Insteon;

var Action = {
	spark: function(method, data) {
		console.log(data);
		var core = new spark.Core(data.accessToken, data.deviceID);
		
		core[data.func](data.params, function(err, data) {
			console.log(data);
		});
	},
	hue: function(method, data) {
		var hue = new HueApi(data.hostname, data.username);
		// console.log(require("node-hue-api"));
		hue.groups(function(err, config) {
		    if (err) throw err;
		    console.log(config);
		});

		var states = {
		    rainy: LightState.create().on().rgb(0, 0, 255).brightness(80),
		    cold: LightState.create().on().rgb(255,0,0).brightness(80),
		    sunny: LightState.create().on().white(500, 80),
		    off: LightState.create().off().effect('none'),
		    on: LightState.create().on().white(400, 70),
		    night: LightState.create().on().white(500, 10),
		    dinner: LightState.create().on().rgb(150, 15, 200),
		    white: LightState.create().on().white(500, 20),
		    party: LightState.create().on().hsl(260, 99, 100)
		};

		var hueState = false;

		hue.setGroupLightState(0, states[data.state], function(err, result) {
		    if (err) throw err;
		    	console.log(result);
		});
	},
	insteon: function(method, data) {
		var gateway = new Insteon(data.settings.hubIP, data.settings.hubPort);

		if (method === "on") {
			gateway.onFast(data.settings.insteonId, function(){
				console.log("LIGHT ON")
			})
		} else if (method === "off") {
			gateway.offFast(data.settings.insteonId, function(){
				console.log("LIGHT OFF")
			})
		}
		var count = 0;
		
	}
}
module.exports = Action;