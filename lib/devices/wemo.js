var WeMo = new require('wemo');
var events = require('events');
// // console.log("SHIP");

// 	var device;

// 	//init'd with 'device' obj
// 	function Wemo_lightswitch(config) {
// 		var that = this;
// 		//console.log("GHJMGHNV", Wemo_lightswitch);
// 			//{config} has uuid, ip, port
// 		//TODO: device sate db to add conistancy, and lower traffic, and speed up development
// 		//TODO: db helper functions to speed up development and fix scope concern
// 		//if no uuid or its not in state db -> new device
// 		//if uuid, look up IP, Port from state db	
// 		if (config.ip.length == 12 && config.port.toString().length == 5) {
// 			var device = new WeMo(config.ip, config.port);
// 			//what happens when the device doesn't connect???

// 			this.device = device;
// 			//events
// 		}
// 	};
// 	Wemo_lightswitch.prototype.init = function() {
// 		events.EventEmitter.call(this);
			
// 		var lightState = "off";
// 		setInterval(function(){
// 			//TODO: make device database for device state - (redis??)
// 			//read light_state from db
// 			var state = this.status(function(data){return data.state})
// 			if (state !== lightState) {
// 	        	lightState = state;
// 	        	//Write to db the new light state.
// 	        	//emit event of motion change.
// 	        	//in the on."change", pass in lightState and emit event of either "motion" or "no motion"
// 	        	console.log("LIGHTSWITCH CHANGE");
// 	        	this.emit('change');
// 	        	if (motionState === "off") {
// 	        		this.emit('off');
// 	        	} else if (motionState === "on") {
// 	        		this.emit('on');
// 	        	};
// 	        }
// 		}, this.status(function(data){return data.refreshRate}));
// 		return this.status();
// 	};
// 	Wemo_lightswitch.prototype.__proto__ = events.EventEmitter.prototype;

// 	Wemo_lightswitch.prototype.on = function() {
// 		this.device.setBinaryState(1, function(err, result) { // switch on
// 		    if (err) console.error(err);
// 		    //event
// 		    this.emit('on');
// 		    return this.status();
// 		});
// 	};
// 	Wemo_lightswitch.prototype.off = function() {
// 		this.device.setBinaryState(0, function(err, result) { // switch off
// 		    if (err) console.error(err);
// 		    //event
// 		    this.emit('off');
// 		    return this.status(); 
// 		});
// 	};
// 	Wemo_lightswitch.prototype.status = function(cb) {
// 		var data = {
// 			type: "WeMo Lightswitch",
// 			refreshRate: 2000
// 			//insert uuid, state, nickname(?), online(?)
// 		}
// 		//db lookup uuid and device status db look up state
// 		this.device.getBinaryState(function(err, result) {
// 	        if (err) console.error(err);
// 	   		if (result) {
// 	   			data.state = "on";
// 	   		} else {
// 	   			data.state = "off";
// 	   		}
// 	   		cb(data);
//     	});
// 	};

// 	console.log("LDJKGJHDJKH", device);
	
// module.exports = Wemo_lightswitch;
	
	




// module.exports = wemo_motion;
// module.exports = wemo_switch;