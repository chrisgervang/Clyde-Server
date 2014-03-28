/*var wemo;
var WeMo = new require('wemo');

var events = require('events');

module.exports = exports = wemo = function wemo_module() {
		var public_functions = {};

		function search_dev() {
			var client = WeMo.Search(undefined, function(client){
				console.log(client);
			});

			console.log(client.sock._events);
		}
		

		function init_dev(config) {
			//{config} has uuid, ip, port
			//TODO: device sate db to add conistancy, and lower traffic, and speed up development
			//TODO: db helper functions to speed up development and fix scope concern
			//if no uuid or its not in state db -> new device
			//if uuid, look up IP, Port from state db	
			console.log(config)


			if (config.ip && config.port.toString().length == 5) {
				var device = new WeMo(config.ip, config.port);
				//what happens when the device doesn't connect???

				this.device = device;
				//events
				events.EventEmitter.call(this);
				var motionState = "stillness";
				var that = this;
				console.log("STATUS", status_dev());
				console.log("THAT", that);
				this.emit('motion');
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

				}, 2000);
			}
			return this.status();
		}

		function on_dev() {
			this.device.setBinaryState(1, function(err, result) { // switch on
			    if (err) console.error(err);
			    //event
			    this.emit('on');
			    return this.status();
			});
		}

		function off_dev() {
			this.device.setBinaryState(0, function(err, result) { // switch on
			    if (err) console.error(err);
			    //event
			    this.emit('off');
			    return this.status();
			});
		}

		function status_dev() {
			var data = {
				type: "WeMo Motion",
				refreshRate: 2000
				//insert uuid, state, nickname(?), online(?)
			}
			console.log("THATGT");
			//db lookup uuid and device status db look up state
			
				this.device.getBinaryState(function(err, result) {
			        if (err) console.log(err);
			   		if (result) {
			   			console.log("ON");
			   			data.state = "on";
			   		} else {
			   			console.log("OFF");
			   			data.state = "off";
			   		}
			   		return data;
		    	});
			
		}



		function motion() {
				this.init = init_dev;
				this.status = status_dev;
				//this = events.EventEmitter.prototype
		}
		motion.prototype.__proto__ = events.EventEmitter.prototype;


		public_functions = {
			Motion: motion,
			switch: {
				init: init_dev,
				status: status_dev,
				on: on_dev,
				off: off_dev
			},
			lightswitch: {
				init: init_dev,
				status: status_dev,
				on: on_dev,
				off: off_dev
			}
		};
		console.log(events.EventEmitter.prototype);

		
	return public_functions;
};



///////////////////////////////////////////////////////////////////////////////////////
// var wemo_motion= {
// 	init: function(config) {
// 		//{config} has uuid, ip, port
// 		//TODO: device sate db to add conistancy, and lower traffic, and speed up development
// 		//TODO: db helper functions to speed up development and fix scope concern
// 		//if no uuid or its not in state db -> new device
// 		//if uuid, look up IP, Port from state db	



// 		if (config.ip.length == 12 && config.port.length == 5) {
// 			var device = new WeMo(config.ip, config.port);
// 			//what happens when the device doesn't connect???

// 			this.device = device;
// 			//events
// 			events.EventEmitter.call(this);
// 			this.__proto__ = events.EventEmitter.prototype;
// 			var motionState = "stillness";
// 			setInterval(function(){
// 				//TODO: make device database for device state - (redis??)
// 				//read light_state from db
// 				if (this.status().state !== motionState) {
// 		        	motionState = result;
// 		        	//Write to db the new light state.
// 		        	//emit event of motion change.
// 		        	//in the on."change", pass in motionState and emit event of either "motion" or "no motion"
// 		        	console.log("MOTION CHANGE");
// 		        	if (motionState === "motion") {
// 		        		this.emit('motion');
// 		        	} else if (motionState === "stillness") {
// 		        		this.emit('stillness');
// 		        	};
		        	
// 		        }

// 			}, this.status().refreshRate);
// 		}
// 		return this.status();
// 	},
// 	status: function() {
// 		var data = {
// 			type: "WeMo Motion",
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
// 	   		return data;
//     	});
// 	}
// }*/