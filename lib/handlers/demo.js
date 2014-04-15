var config  = require('../config');
var Action = require('../Action.js');
var hueIP = "192.168.0.100";

var Sonos = require('sonos').Sonos;
var sonos = new Sonos(process.env.SONOS_HOST || '192.168.0.101', process.env.SONOS_PORT || 1400);

var assets = "http://192.168.0.110:8000";

var demo = function(request, reply) {
	if (request.params.type == "default") {
        console.log("changing config to one");
        config.config = 'one';
        Action.hue('setGroupLightState',{hostname: hueIP, username: "3a05e04e39a37c71891c16239b67beb", state: "off"});
        sonos.stop(function(err, playing) {
                reply("four", err, playing);
        });
        reply("one");
    } else if(request.params.type == "wake") {
        console.log("changing config to two");
        //add video song here
        config.config = 'two';
        Action.hue('setGroupLightState',{hostname: hueIP, username: "3a05e04e39a37c71891c16239b67beb", state: "on"});
        sonos.queueNext(assets + "/So_Danco_Samba.mp3", function(err, playing){
            console.log([err, playing]);
            sonos.play(function(err, playing) {
                reply("two", err, playing);
            });
        });
    } else if (request.params.type == "kitchen") {
        console.log("changing config to three");
        config.config = 'three';
        reply("three");
    } else if(request.params.type == "sleep") {
        console.log("changing config to four");
        config.config = 'four';
        reply("four");
    } else if(request.params.type == "night") {
        console.log("changing config to five");
        config.config = 'five';
        setTimeout(function(){
        	Action.hue('setGroupLightState', {hostname: hueIP, username: "3a05e04e39a37c71891c16239b67beb", state: "off"});
        },100)
        reply("five");
    } 
}

module.exports = demo;