var nano    = require('nano')('http://localhost:5984'),
	db_name = "clyde"
	db      = nano.use(db_name);

var insert_doc = function(doc, tried, cb) {
	var id, rev;
	db.insert(doc, 'chunk', function (error,http_body,http_headers) {
		if(error) {
			if(error.message === 'no_db_file'  && tried < 1) {
            	// create database and retry
        	    return nano.db.create(db_name, function () {
    	        	insert_doc(doc, tried+1, cb);
	            });
	        } else { return console.log(error); }
    	}
    	console.log(http_body);
    	cb(http_body);
	});
}

var create = function(request, reply) {
	if (request.params.type == "chunk") {
		var newChunk = {
			triggerModifier: "",
			triggers: [{href: ""}],
			actionModifier: "",
			actions: [{href: ""}]
		}

		insert_doc(newChunk, 0, function(response) {
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

