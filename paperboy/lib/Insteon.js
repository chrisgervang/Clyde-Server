var _ = require('lodash');

var hub = {};
var in_init = function(config, cb) {
	if (!hub.id) {
		new Insteon(config, function(result){
			hub = result
			cb(hub);
		});
	} else {
		//console.log("HUB", hub, "CB", cb)
		cb(hub);
	}
	
}

var Insteon = function(config, cb) {
	//var Insteon = require('home-controller').Insteon;
	var Insteon = require('../../../home-controller').Insteon;
	// this.config = config;
	_.assign(this, config);
	var inner = {};
	inner.gw = new Insteon();
	this.init = function() {
		var that  = this;
		inner.gw.connect(that.settings.hubIp, function(){
			//var that = this;
			console.log(that);
			that.state.online = true;
			setInterval(function(){
				inner.gw.ping(that.settings.devID, function(){
					console.log("Success ping!");
				})
			},300000)
			cb(that);
		});


	}
	this.init();

	this.level = function(devId, cb) {
		var that = this;
		if (that.state.online === true) {
			inner.gw.level(devId, function(err, result){
				if (err === "404") {
					console.log("ERROR",err, devId);
					cb(null, err);
				} else {
					cb(result, err);
				}
			});
		} else {
			cb(null, "Error: Hub not online");
		}
	}
	this.rampRate = function(devId, cb) {
		var that = this;
		if (that.state.online === true) {
			inner.gw.rampRate(devId, function(err, result){
				cb(result);
			});
		} else {
			cb(null, "Error: Hub not online");
		}
	}
	this.onLevel = function(devId, cb) {
		var that = this;
		if (that.state.online === true) {
			inner.gw.onLevel(devId, function(err, result){
				cb(result);
			});
		} else {
			cb(null, "Error: Hub not online");
		}
	}
	this.turnOnFast = function(devId, cb) {
		var that = this;
		if (that.state.online === true) {
			inner.gw.turnOnFast(devId, function(err, result){
				cb(result);
			});
		} else {
			cb(null, "Error: Hub not online");
		}
	}
	this.turnOffFast = function(devId, cb) {
		var that = this;
		if (that.state.online === true) {
			inner.gw.turnOffFast(devId, function(err, result){
				cb(result);
			});
		} else {
			cb(null, "Error: Hub not online");
		}
	}
	this.turnOff = function(devId, ramp, cb) {
		var that = this;
		if (that.state.online === true) {
			inner.gw.turnOff(devId, ramp, function(err, result){
				cb(result);
			});
		} else {
			cb(null, "Error: Hub not online");
		}
	}
	this.turnOn = function(devId, level, ramp, cb) {
		var that = this;
		if (that.state.online === true) {
			inner.gw.turnOn(devId, level, ramp, function(err, result){
				cb(result);
			});
		} else {
			cb(null, "Error: Hub not online");
		}
	}
	
}

module.exports = {Insteon: in_init};