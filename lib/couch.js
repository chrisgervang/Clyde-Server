//couchDB helper file
var nano    = require('nano')('http://localhost:5984');
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

module.exports = insert_doc;