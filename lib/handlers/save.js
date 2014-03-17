var extend  = require('node.extend'),
    nano    = require('nano')('http://localhost:5984'),
	db_name = "clyde"
	db      = nano.use(db_name);

var insert_doc = function(doc, dbName, tried, cb) {
	
    db      = nano.use(dbName);
    var id, rev;
	//get current document
	db.get(doc._id, function (err, body, header) {
    //set incoming as newest doc
    if (!err && body)
      doc._rev = body._rev;
        console.log("dbName", dbName);
        db      = nano.use(dbName);
		db.insert(doc, function (error,http_body,http_headers) {
			if(error) {
				if(error.message === 'no_db_file'  && tried < 1) {
                	// create database and retry
            	    return nano.db.create(dbName, function () {
                        db      = nano.use(dbName);
        	        	insert_doc(doc, dbName, tried+1, cb);
                    });
		        } else { 
                    return console.log(error); 
                }
	       }
	       //console.log(http_body);
	       cb(http_body);
		});
	});
}

var save = function (request, reply) {
	var experiences = request.payload.experiences;
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
    		
            // Deep copy - UGHHHHHHHHHHHHHHHHHHHH
            var devices = extend(true, {}, chunk.triggers);
            var devPoop = devices['0'];
            var device_array = [];
            var counter = 0;
            while(devPoop !== undefined) {
                console.log("DEVPOOP", devPoop);
                device_array.push(devPoop);
                counter++;
                devPoop = devices[counter.toString()];
            }
            // console.log("de:" + typeof device_array, device_array);
            // console.log("TRIGGERSSSSSSSSSS", chunk.triggers)
            for (var i = 0; i < chunk.actions.length; i++) {
                device_array.push(chunk.actions[i]);
            }
            //console.log("TRIGGERSSSSSSSSSS", chunk.triggers)
            //** end deep copy and actions add. SO UGLY #sorrynotsorry.

            //console.log("de:" + typeof device_array, device_array);
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

                console.log(device_insert);

                //chunk database insert
                insert_doc(device_insert, 'devices', 0, function(body) {
                    reply(body).code(200);
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
    			reply(body).code(200);
    		});
    		
    	});

    	//sanatize experience
    	for (var i = experience.chunks.length - 1; i >= 0; i--) {
    		console.log();
    		experience.chunks[i] = {href: "http://api.clyde.com/chunks/"+experience.chunks[i]._id}
    	}

    	insert_doc(experience, 'experiences', 0, function(body){
    		reply(body).code(200);
    	});
    		
	})

	//console.log(chunks);
	//console.log(request.raw.req.headers)
    reply(request.payload).code(200);
    
};

module.exports = save;