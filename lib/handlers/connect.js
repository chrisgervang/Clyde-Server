//var WeMo = require('../devices/wemo');
var Firebase = require('firebase');
var clydedevices = new Firebase('https://clydedev.firebaseio.com/devices/');
var WeMo = new require('wemo');
var deviceDesignDB = new Firebase('https://clydedev.firebaseio.com/deviceDesigns/');
var _ = require('lodash');
var Action = require('../Action');

var connect = function(request, reply) {

	var device = request.payload.device;
	/*{
		"userId":
		"designRef":
		"device": {
			"idOfSorts"
		}
	}*/
	console.log(device);

	deviceDesignDB.once('value', function(snapshot){
		var designs = snapshot.val();
		var _newDevice = designs[device.designRef];
		if (!!device.userId && device.userId !== "_temp") {
			_newDevice.userId = device.userId;
		}

		var _refDeviceDB = clydedevices.push(_newDevice, function(err){
			_refDeviceDB.update({id: _refDeviceDB.name(), designRef: device.designRef}, function(err){
				_refDeviceDB.on('value', function(snapshot){

					//var shout = new Shouter({id: snapshot.val().id});

					reply(snapshot.val()).code(200);
				});
			});
		});
	});
	

}

module.exports = connect;