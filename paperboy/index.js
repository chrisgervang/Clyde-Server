var http    = require('http'),
    Hapi = require('hapi');

var command = require('./handlers/command'),
	devices = require('./handlers/devices');

var server = new Hapi.Server('10.0.1.135', 8000, { cors: true });

	server.route([
		{ method: 'GET', path: '/', handler: index },
		{ method: 'POST', path: '/command/{type}', handler: command},
		{ method: 'GET', path: '/devices', handler: devices}
	]);

	server.start();


	//On startup grab all firebase devices and start shouters for them. Shouters should be shouting *deltas only* to firebase. Then catchers in teh cloud are listening to firebase 'value' changes.