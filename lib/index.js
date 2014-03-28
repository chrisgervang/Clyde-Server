var http    = require('http'),
    Hapi = require('hapi');
	//handlers
	var load = require('handlers/load'),
		  save = require('handlers/save'), 
		  index = require('handlers/index'),
		  create = require('handlers/create'),
		  trigger = require('handlers/trigger');


	var server = new Hapi.Server('localhost', 8000, { cors: true });

	server.route([
		{ method: 'GET', path: '/', handler: index },
		{ method: 'GET', path: '/load', handler: load },
		{ method: 'POST', path: '/save', handler: save }, //should be PUT
		{ method: 'GET', path: '/create/{type}', handler: create},
		{ method: 'POST', path: '/trigger/{type}', handler: trigger}
	]);
//demo loading
// require('./demo2.js');

	server.start();


	


//Persistant data for the user

//Logging server logs