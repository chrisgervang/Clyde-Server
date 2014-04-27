//POST to /device to pass a command to make a device do something
//POST to /group to pass a command to a group of devices to do something

//based off devices in Firebase. SO the POST JSON looks like:

/*{
	"id":"firebaseID",
	"action": {
		"data":
		"method":
	}
}*/

//from ID, expand all device data from firebase. use this to command a "Action"

var command = function(request, reply) {
	if (request.params.type === "device") {

	} else if (request.params.type === "group") {

	};
}

module.exports = command;