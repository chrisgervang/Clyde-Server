var events = require('events');

function peb_init (config) {
	var p = new Pebble(config);
	return p;
}

function Pebble(config) {
	events.EventEmitter.call(this);
	this.buttonPress = function(name) {
		var that = this;
		that.scope_event(name);
	}

	this.scope_event = function(word) {
		//console.log("HI");
		this.emit(word);
	}
}

Pebble.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = {
	Watch: peb_init
}