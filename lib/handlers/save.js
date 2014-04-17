require('../demo.js')
var extend  = require('node.extend'),
    nano    = require('nano')('http://localhost:5984'),
	db_name = "clyde"
	db      = nano.use(db_name),
    insert_doc = require('../couch.js');
var _       = require('lodash');

var config  = require('../config');



//Make a method that counts
//# of ex, ch, and dev's. We can call it a validator function. return json in callback.
var expect = function(body, cb) {
    console.log(body);

    var count = {
        expCount: body.length,
        chuCount: body[0].chunks.length,
        devCount: body[0].chunks[0].triggers.length + body[0].chunks[0].actions.length
    };
    return cb(count); 
    
}
var inserted;
var deviceConfig;

var finished = function(actual, expected) {
    console.log("Actual", actual, "Excpected", expected);
    if (actual.expCount !== expected.expCount) {
        return false;
    } else if (actual.chuCount !== expected.chuCount) {
        return false;
    } else if(actual.devCount !== expected.devCount) {
        return false;
    }
    return true;
}



var configDemo = function(deviceConfig) {
    var slugs = _.map(deviceConfig, 'slug')
    if (_.contains(slugs, 'motion')) {
        console.log("changing config to three");
        config.config = 'three';
    } else if(_.contains(slugs, 'switch')) {
        console.log("changing config to two");
        config.config = 'two';
    } else if(_.contains(slugs, 'night')) {
        console.log("changing config to five");
        config.config = 'five';
    } else if(_.contains(slugs, 'dinner')) {
        console.log("changing config to four");
        config.config = 'four';
    } else if (!_.contains(slugs, 'motion') && !_.contains(slugs, 'switch')) {
        console.log("changing config to one");
        config.config = 'one';
    }
    return;
}

var save = function (request, reply) {
    deviceConfig = [];
    inserted = {
        expCount: 0,
        chuCount: 0,
        devCount: 0
    }
	var experiences = request.payload.experiences;

    expect(experiences, function(expecting) {
        console.log(expecting);


        console.log("ex:" + typeof experiences);
        //each experience
        experiences.forEach(function(experience, index, array) {
            console.log("-experiences[" + index + "] = " + experience.name);
            console.log(experience);

            var chunks = experience.chunks;
            console.log(typeof chunks);
            //each chunk
            chunks.forEach(function(chunk, index, array) {
                console.log("--chunks[" + index + "] = " + chunk._id);
                
                var device_array = _.cloneDeep(chunk.triggers);
                for (var i = 0; i < chunk.actions.length; i++) {
                    device_array.push(chunk.actions[i]);
                }
                console.log("SHIPPPPPPPPP", device_array);

                device_array.forEach(function(device, index, array) {
                    console.log("---devices[" + index + "] = " + device._id);
                    var device_insert = {
                        _id: device._id,
                        name: device.name,
                        slug: device.slug,
                        type: device.type,
                        category: device.category,
                        color: device.color,
                        iconClass: device.iconClass,
                        selections: device.selections
                    };

                    //chunk database insert
                    insert_doc(device_insert, 'devices', 0, function(body) {
                        deviceConfig.push(device_insert);
                        inserted.devCount += 1;
                        if(finished(inserted, expecting)) {
                            configDemo(deviceConfig);
                            reply(body).code(200);   
                        }
                    });
                });

                //sanatize chunk triggers
                for (var i = chunk.triggers.length - 1; i >= 0; i--) {
                    console.log();
                    delete chunk.triggers[i].name; 
                    delete chunk.triggers[i].slug; 
                    delete chunk.triggers[i].type; 
                    delete chunk.triggers[i].category; 
                    delete chunk.triggers[i].color; 
                    delete chunk.triggers[i].iconClass; 
                    delete chunk.triggers[i].selections;
                    chunk.triggers[i].href = "http://api.clyde.com/devices/"+chunk.triggers[i]._id;
                }

                //sanatize chunk actions
                for (var i = chunk.actions.length - 1; i >= 0; i--) {
                    console.log();
                    delete chunk.actions[i].name; 
                    delete chunk.actions[i].slug; 
                    delete chunk.actions[i].type; 
                    delete chunk.actions[i].category; 
                    delete chunk.actions[i].color; 
                    delete chunk.actions[i].iconClass; 
                    delete chunk.actions[i].selections;
                    chunk.actions[i].href = "http://api.clyde.com/devices/"+chunk.actions[i]._id;
                }

                //chunk database insert
                insert_doc(chunk, 'chunks', 0, function(body) {
                    inserted.chuCount += 1;
                    if(finished(inserted, expecting)) {
                        reply(body).code(200);   
                    }
                });
                
            });

            //sanatize experience
            for (var i = experience.chunks.length - 1; i >= 0; i--) {
                console.log();
                experience.chunks[i] = {href: "http://api.clyde.com/chunks/"+experience.chunks[i]._id}
            }

            insert_doc(experience, 'experiences', 0, function(body){
                inserted.expCount += 1;
                if(finished(inserted, expecting)) {
                    reply(body).code(200);   
                }
                 //TODO: on save - run config scripts that update device configuration. 
            });
                
        })
    })

    //reply("failed to insert everything", inserted).code(500);
    
};

module.exports = save;


/*
DEVICE CONFIGUATION:

action blocks get grouped together by chunk to fire on an event | SkyNet websocket rooms
trigger blocks get grouped together by chunk to emit an event | SkyNet websocket rooms

connecting a new device (new db entery) will initiate that device as online | SkyNet add device

get this to work, then find out how to contruct the config JSON's
*/