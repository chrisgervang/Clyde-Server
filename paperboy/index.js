var http    = require('http'),
    Hapi = require('hapi');

var command = require('./handlers/command'),
	devices = require('./handlers/devices');

var Firebase = require('firebase');
var clydepebble = new Firebase('https://clydepebble.firebaseio.com/');
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

var date = 0;

var server = new Hapi.Server(ip[0], 8000, { cors: true });

	server.route([
		{ method: 'POST', path: '/command', handler: command},
		{ method: 'GET', path: '/devices', handler: devices},
    { method: 'GET', path: '/{path*}', handler: {
          directory: { path: '../public', listing: true, index: false }
      }
    },
    { method: 'GET', path: '/pebble/{button}', handler: function (request, reply) {

      
      if (request.params.button === "1") {
        clydepebble.update({topButton: date});
        console.log("1");
        date += 1;
        reply("1").code(200);
      } else if (request.params.button === "2") {
        clydepebble.update({middleButton: date});
        console.log("2");
        date += 1;
        reply("2").code(200);
      } else if (request.params.button === "3") {
        clydepebble.update({bottomButton: date});
        console.log("3");
        date += 1;
        reply("3").code(200);
      }
    }}
	]);

	server.start();


	//On startup grab all firebase devices and start shouters for them. Shouters should be shouting *deltas only* to firebase. Then catchers in teh cloud are listening to firebase 'value' changes.