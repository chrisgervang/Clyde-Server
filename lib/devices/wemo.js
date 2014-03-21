var WeMo = new require('wemo');
var events = require('events');

var wemo_lightswitch = {
		//init'd with 'device' obj
		init: function(config) {
				//{config} has uuid, ip, port
			//TODO: device sate db to add conistancy, and lower traffic, and speed up development
			//TODO: db helper functions to speed up development and fix scope concern
			//if no uuid or its not in state db -> new device
			//if uuid, look up IP, Port from state db	
			console.log(config.ip.length, "jsdhfkaj", config.ip.toString().length);
			if (config.ip.length == 12 && config.port.toString().length == 5) {
				var device = new WeMo(config.ip, config.port);
				//what happens when the device doesn't connect???

				this.device = device;

				console.log("device:::", this.device);
				//events
				events.EventEmitter.call(this);
				this.__proto__ = events.EventEmitter.prototype;
				
				var lightState = "off";
				setInterval(function(){
					//TODO: make device database for device state - (redis??)
					//read light_state from db
					if (wemo_lightswitch.status(function(data){return data.state}) !== lightState) {
			        	lightState = wemo_lightswitch.status(function(data){return data.state});
			        	//Write to db the new light state.
			        	//emit event of motion change.
			        	//in the on."change", pass in lightState and emit event of either "motion" or "no motion"
			        	console.log("LIGHTSWITCH CHANGE");
			        	this.emit('change');
			        	if (motionState === "off") {
			        		this.emit('off');
			        	} else if (motionState === "on") {
			        		this.emit('on');
			        	};
			        }
				}, wemo_lightswitch.status(function(data){return data.refreshRate}));
			}
			return wemo_lightswitch.status();
		},
		on: function() {
			this.device.setBinaryState(1, function(err, result) { // switch on
			    if (err) console.error(err);
			    //event
			    this.emit('on');
			    return this.status();
			});
		},
		off: function() {
			this.device.setBinaryState(0, function(err, result) { // switch off
			    if (err) console.error(err);
			    //event
			    this.emit('off');
			    return this.status(); 
			});
		},
		status: function(cb) {
			var data = {
				type: "WeMo Lightswitch",
				refreshRate: 2000
				//insert uuid, state, nickname(?), online(?)
			}
			//db lookup uuid and device status db look up state
			this.device.getBinaryState(function(err, result) {
		        if (err) console.error(err);
		   		if (result) {
		   			data.state = "on";
		   		} else {
		   			data.state = "off";
		   		}
		   		cb(data);
	    	});
		},
	};

module.exports = {
	wemo_lightswitch: wemo_lightswitch,
  	wemo_switch: {
		init: function(config){
			//{config} has uuid, ip, port
			//TODO: device sate db to add conistancy, and lower traffic, and speed up development
			//TODO: db helper functions to speed up development and fix scope concern
			//if no uuid or its not in state db -> new device
			//if uuid, look up IP, Port from state db	



			if (config.ip.length == 12 && config.ip.length == 5) {
				var device = new WeMo(config.ip, config.port);
				//what happens when the device doesn't connect???

				this.device = device;
				//events
				events.EventEmitter.call(this);
				this.__proto__ = events.EventEmitter.prototype;
				var switchState = "off";
				setInterval(function(){
					//TODO: make device database for device state - (redis??)
					//read light_state from db
					if (this.status(function(data){return data.state}) !== switchState) {
			        	switchState = result;
			        	//Write to db the new light state.
			        	//emit event of motion change.
			        	//in the on."change", pass in switchState and emit event of either "motion" or "no motion"
			        	console.log("SWITCH CHANGE");
			        	this.emit('change');
			        	if (motionState === "off") {
			        		this.emit('off');
			        	} else if (motionState === "on") {
			        		this.emit('on');
			        	};
			        }
				}, this.status(function(data){return data.refreshRate}));
			}
			return this.status();
		},
		on: function() {
			this.device.setBinaryState(1, function(err, result) { // switch on
			    if (err) console.error(err);
			    //event
			    this.emit('on');
			    return this.status();
			});
		},
		off: function() {
			this.device.setBinaryState(0, function(err, result) { // switch off
			    if (err) console.error(err);
			    //event
			    this.emit('off');
			    return this.status(); 
			});
		},
		status: function(cb) {
			var data = {
				type: "WeMo Switch",
				refreshRate: 2000
				//insert uuid, state, nickname(?), online(?)
			}

			//db lookup uuid and device status db look up state
			this.device.getBinaryState(function(err, result) {
		        if (err) console.error(err);
		   		if (result) {
		   			data.state = "on";
		   		} else {
		   			data.state = "off";
		   		}
		   		//cb
		   		cb(data);
	    	});
		}
	},
	wemo_motion: {
		init: function(config) {
			//{config} has uuid, ip, port
			//TODO: device sate db to add conistancy, and lower traffic, and speed up development
			//TODO: db helper functions to speed up development and fix scope concern
			//if no uuid or its not in state db -> new device
			//if uuid, look up IP, Port from state db	



			if (config.ip.length == 12 && config.ip.length == 5) {
				var device = new WeMo(config.ip, config.port);
				//what happens when the device doesn't connect???

				this.device = device;
				//events
				events.EventEmitter.call(this);
				this.__proto__ = events.EventEmitter.prototype;
				var motionState = "stillness";
				setInterval(function(){
					//TODO: make device database for device state - (redis??)
					//read light_state from db
					if (this.status().state !== motionState) {
			        	motionState = result;
			        	//Write to db the new light state.
			        	//emit event of motion change.
			        	//in the on."change", pass in motionState and emit event of either "motion" or "no motion"
			        	console.log("MOTION CHANGE");
			        	if (motionState === "motion") {
			        		this.emit('motion');
			        	} else if (motionState === "stillness") {
			        		this.emit('stillness');
			        	};
			        	
			        }

				}, this.status().refreshRate);
			}
			return this.status();
		},
		status: function() {
			var data = {
				type: "WeMo Motion",
				refreshRate: 2000
				//insert uuid, state, nickname(?), online(?)
			}
			//db lookup uuid and device status db look up state
			this.device.getBinaryState(function(err, result) {
		        if (err) console.error(err);
		   		if (result) {
		   			data.state = "on";
		   		} else {
		   			data.state = "off";
		   		}
		   		return data;
	    	});
		}
	}
}