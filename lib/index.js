var http	= require('http'),
    Hapi 	= require('hapi');

//handlers
var load 	= require('./handlers/load'),
	save 	= require('./handlers/save'), 
	index 	= require('./handlers/index'),
	create 	= require('./handlers/create'),
	trigger = require('./handlers/trigger'),
	demo 	= require('./handlers/demo'),
	connect = require('./handlers/connect');

require('./helpers.js').Coach();


var server = new Hapi.Server(require('./utility').serverIp(), 8000, { cors: true });
//var server = new Hapi.Server('10.0.1.65', 8000, { cors: true });

server.route([
	{ method: 'GET', path: '/', handler: index },
	{ method: 'GET', path: '/load', handler: load },
	{ method: 'POST', path: '/save', handler: save }, //should be PUT
	{ method: 'GET', path: '/create/{type}', handler: create},
	{ method: 'GET', path: '/trigger/{type}', handler: trigger},
	{ method: 'POST', path: '/demo/{type}', handler: demo},
	{ method: 'GET', path: '/{path*}', handler: {
        	directory: { path: '../public', listing: true, index: false }
    	}
    },
    { method: 'POST', path: '/connect', handler: connect }
]);

server.start();