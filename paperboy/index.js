var http    = require('http'),
    Hapi = require('hapi');

var command = require('./handlers/command'),
	devices = require('./handlers/devices');

	//require('./lib/helpers');

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

	server.route([
		{ method: 'POST', path: '/command', handler: command},
		{ method: 'GET', path: '/devices', handler: devices},
    { method: 'GET', path: '/{path*}', handler: {
          directory: { path: '../public', listing: true, index: false }
      }
    }
	]);

	server.start();


	//On startup grab all firebase devices and start shouters for them. Shouters should be shouting *deltas only* to firebase. Then catchers in teh cloud are listening to firebase 'value' changes.