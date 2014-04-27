var config  = require('../config');
var Action = require('../Action.js');
var hueIP = "192.168.0.103";

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
        sonos.queueNext(assets + "/Two_Weeks.mp3", function(err, playing){
            console.log([err, playing]);
            sonos.setVolume("10", function() {
                sonos.play(function(err, playing) {
                    fade(0, 40, function() {
                        reply("two", err, playing);    
                    });
                });    
            });
            
        });
        var fade = function(from, to, cb) {
            setTimeout(function(){
                sonos.setVolume("" + from, function(err, data){
                    console.log(data, err);
                    if (from >= to) {
                        console.log("DONE", from);
                        cb();
                    } else {
                        from++;
                        fade(from, to, cb);
                    }
                });
            },10);
        }
        
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
    } else if(request.params.type == "party") {
        console.log("changing config to six");
        config.config = 'six';
        sonos.queueSpotify(function(err, queued){
            console.log(err, queued);
        })
        Action.hue('setGroupLightState',{hostname: hueIP, username: "3a05e04e39a37c71891c16239b67beb", state: "party"});
        reply("six");

    }

}

module.exports = demo;