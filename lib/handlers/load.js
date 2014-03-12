var nano    = require('nano')('http://localhost:5984'),
	db_name = "clyde"
	db      = nano.use(db_name);

var load = function (request, reply) {
	//var chunks;
	//TODO: add doc name to every insert so we can look up by docname. in nano documentation.
	db.get({type: 'experience'}, function(err, body, header) {
		reply(body);
	});
    
};

module.exports = load;