var WeMo = new require('wemo');
var events = require('events');

function mo_init(config) {
	var l = new Motion(config);
	return l;
}

function Motion(config) {
	//{config} has uuid, ip, port
	//TODO: device sate db to add conistancy, and lower traffic, and speed up development
	//TODO: db helper functions to speed up development and fix scope concern
	//if no uuid or its not in state db -> new device
	//if uuid, look up IP, Port from state db

	console.log(config);
	if (!!config && !!config.ip && !!config.port) {
		var device = new WeMo(config.ip, config.port);
		//what happens when the device doesn't connect??? - handle that dawg
		this.device = device;
		//events
		events.EventEmitter.call(this);
	}
	
	this.status = function status(cb, silent) {
		//db lookup uuid and device status db look up state
		device.getBinaryState(function(err, result) {
	        if (err && !!silent) console.log(err);
	        //console.log("RESULLLTTTTTT", result)
	   		if (result == 1) {
	   			console.log("MOTION");
	   			data.state = "motion";
	   		} else {
	   			console.log("NO MOTION");
	   			data.state = "stillness";
	   		}
	   		cb(data);
    	});
	}

	this.init = function init(silent) {
		var motionState = "stillness";
		var that = this;
		that.scope_event('stillness');
		setInterval(function(){
			//TODO: make device database for device state - (redis??)
			//read light_state from db
			that.status(function(result, silent){
				// console.log(result);
				if (result.state !== motionState) {
		        	motionState = data.state;
		        	//Write to db the new light state.
		        	//emit event of motion change.
		        	//in the on."change", pass in motionState and emit event of either "motion" or "no motion"
		        	console.log("MOTION CHANGE");
		        	if (motionState === "motion") {
		        		that.scope_event('motion');
		        		//cb('motion')
		        	} else if (motionState === "stillness") {
		        		//cb('stillness');
		        		that.scope_event('stillness');
		        	};
		        	
		        }
	        });
	    
		}, data.refreshRate);
	}
	this.scope_event = function(word) {
		//console.log("HI");
		this.emit(word);
	}

	data = {
			type: "WeMo Motion",
			refreshRate: 400,
			state: "",
			online: false
			//insert uuid, state, nickname(?), online(?)
	}
}

Motion.prototype.__proto__ = events.EventEmitter.prototype;


//////////////////////////////////////////////////////////////SWITCH////
function sw_init(config) {
	var s = new Switch(config);
	return s;
}

function Switch(config) {
	//{config} has uuid, ip, port
	//TODO: device sate db to add conistancy, and lower traffic, and speed up development
	//TODO: db helper functions to speed up development and fix scope concern
	//if no uuid or its not in state db -> new device
	//if uuid, look up IP, Port from state db	
	console.log(config);
	if (!!config && !!config.ip && !!config.port) {
		var device = new WeMo(config.ip, config.port);
		//what happens when the device doesn't connect??? - handle that dawg
		this.device = device;
		
		//events
		events.EventEmitter.call(this);
	}

	this.status = function status(cb, silent) {
		//db lookup uuid and device status db look up state
		
		device.getBinaryState(function(err, result) {
	        if (err) console.log(err);
	   		if (result == 1) {
	   			console.log("ON :)");
	   			data.state = "on";
	   		} else {
	   			console.log("OFF :)");
	   			data.state = "off";
	   		}
	   		cb(data);
    	});
	}

	this.init = function init(silent) {
		var switchState = "off";
		var that = this
		setInterval(function(){
			//TODO: make device database for device state - (redis??)
			//read light_state from db
		
			that.status(function(result, silent){
				// console.log("RESULT", result);
				if (result.state !== switchState) {
		        	switchState = data.state;
		        	//Write to db the new light state.
		        	//emit event of motion change.
		        	//in the on."change", pass in switchState and emit event of either "motion" or "no motion"
		        	console.log("SWITCH CHANGE");
		        	if (switchState === "on") {
		        		that.scope_event('on');
		        		//cb('motion')
		        	} else if (switchState === "off") {
		        		//cb('stillness');
		        		that.scope_event('off');
		        	};
		        	
		        }
	        });
	    
		}, data.refreshRate);
	}
	this.scope_event = function(word) {
		//console.log("HI");
		this.emit(word);
	}
	this.switchTo = function(option, silent){
		var that = this;
		if (option == "on") {
			device.setBinaryState(1, function(err, result) { // switch on
			    if (err && !!silent) console.error(err);
			    //event
			    that.scope_event('on');
			    // return this.status;
			});
		} else if(option == "off"){
			device.setBinaryState(0, function(err, result) { // switch on
			    if (err && !!silent) console.error(err);
			    //event
			    that.scope_event('off');
			    // return this.status;
			});
		}
	
	}
	data = {
			type: "WeMo Light Switch",
			refreshRate: 1000,
			state: "",
			online: false
			//insert uuid, state, nickname(?), online(?)
	}
}

Switch.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = {
	Motion: mo_init,
	Switch: sw_init,
	Search: WeMo.Search
}
