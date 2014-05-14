var http    = require('http'),
    Hapi = require('hapi');
	//handlers
	var load = require('./handlers/load'),
		  save = require('./handlers/save'), 
		  index = require('./handlers/index'),
		  create = require('./handlers/create'),
		  trigger = require('./handlers/trigger'),
		  demo = require('./handlers/demo'),
		  connect = require('./handlers/connect');

var poop = require('./helpers.js').Coach();

var os=require('os');
var ifaces=os.networkInterfaces();
var ip = [];
for (var dev in ifaces) {
  var alias=0;
  ifaces[dev].forEach(function(details){
    if (details.family=='IPv4' && details.internal == false) {
      //console.log(dev+(alias?':'+alias:''),details.address);
      ip.push(details.address);
      ++alias;
    }
  });
}
console.log(ip[0]);

	var server = new Hapi.Server(ip[0], 8000, { cors: true });
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
//demo loading
// require('./demo2.js');

	server.start();


	


//Persistant data for the user

//Logging server logs
