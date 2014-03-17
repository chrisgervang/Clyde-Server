var nano    = require('nano')('http://localhost:5984'),
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

		db.insert(doc, function (error,http_body,http_headers) {
			if(error) {
				if(error.message === 'no_db_file'  && tried < 1) {
        	// create database and retry
    	    return nano.db.create(dbName, function () {
	        	insert_doc(doc, dbName, tried+1, cb);
          });
		    } else { return console.log(error); }
	    }
	    //console.log(http_body);
	    cb(http_body);
		});
	});
}

var create = function(request, reply) {
	if (request.params.type == "chunk") {
		var newChunk = {
			triggerModifier: null,
			triggers: [{href: null}],
			actionModifier: null,
			actions: [{href: null}]
		}

		insert_doc(newChunk, 'chunks', 0, function(response) {
			db.get(response.id, function(err, body, header){
				if (err) {
					reply(err).code(505);
				} else {
					reply(body).code(200);
				}	
			});
		});
	} else if (request.params.type == "experience") {
		var newExperience = {
			href: null,
			name: null,
			slug: null,
			color: null,
			chunks: [{href: null}]
		}

		insert_doc(newExperience, 'experiences', 0, function(response) {
			db.get(response.id, function(err, body, header){
				if (err) {
					reply(err).code(505);
				} else {
					reply(body).code(200);
				}	
			});
		});
	} else if (request.params.type == "device") {
		var newDevice = {
      name: null,
      slug: null,
      type: null,
      category: null,
      color: null,
      iconClass: null,
      selections: [
          {
              label: "Set a basic timer.",
              filter: "When it is set.time.12"
          }
      ]
		}

		insert_doc(newDevice, 'devices', 0, function(response) {
			db.get(response.id, function(err, body, header){
				if (err) {
					reply(err).code(505);
				} else {
					reply(body).code(200);
				}	
			});
		});
	}
}

module.exports = create;

