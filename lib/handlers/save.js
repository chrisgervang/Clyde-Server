var nano    = require('nano')('http://localhost:5984'),
	db_name = "clyde"
	db      = nano.use(db_name);

var insert_doc = function(doc, tried, cb) {
	var id, rev;
	//get current document
	db.get(doc._id, function (err, body, header) {
    //set incoming as newest doc
    if (!err && body)
      doc._rev = body._rev;

		db.insert(doc, function (error,http_body,http_headers) {
			if(error) {
				if(error.message === 'no_db_file'  && tried < 1) {
        	// create database and retry
    	    return nano.db.create(db_name, function () {
	        	insert_doc(doc, tried+1, cb);
          });
		    } else { return console.log(error); }
	    }
	    //console.log(http_body);
	    cb(http_body);
		});
	});
}

var save = function (request, reply) {
	var expName
	var experiences = request.payload.experiences;

	//each experience
	experiences.forEach(function(experience, index, array) {
    	console.log("-experiences[" + index + "] = " + experience.name);
    	console.log(experience);

    	var chunks = experience.chunks;
    	//each chunk
    	chunks.forEach(function(chunk, index, array) {
    		console.log("--chunks[" + index + "] = " + chunk._id);
    		//make it chunk type
    		chunk.type = 'chunk';
    		//chunk database insert
    		insert_doc(chunk, 0, function(body) {
    			reply(body).code(200);
    		});
    		
    	});

    	//sanatize experience
    	for (var i = experience.chunks.length - 1; i >= 0; i--) {
    		console.log()
    		experience.chunks[i] = {_id: experience.chunks[i]._id}
    	}
    	//make it experience type
    	experience.type = 'experience';

    	insert_doc(experience, 0, function(body){
    		reply(body).code(200);
    	});
    		
	})

	//console.log(chunks);
	//console.log(request.raw.req.headers)
    reply(request.payload).code(200);
    
};

module.exports = save;