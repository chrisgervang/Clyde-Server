var Firebase = require('firebase');
var _ = require('lodash');

var db = function(root) {
	root = new Firebase('https://clydedev.firebaseio.com/' + root);

	this.load = function(cb) {
		//console.log(this);
		var elements = [];
		root.once('value', function(snapshot){
			//console.log(snapshot.val());
			var eleCount = _.size(snapshot.val());
			var count = 0;
			root.on('child_added', function(snapshot){
				elements.push(snapshot.val());

				count++;
				//console.log(eleCount, count);
				if (count >= eleCount) {
					cb(elements);
				}
			});

		});
	}
	//adds a new id object thing to root.
	this.add = function(data, cb) {
		var _refDB = root.push(data, function(err){
			_refDB.update({id: _refDB.name()}, function(err){
				_refDB.on('value', function(snapshot){
					cb(snapshot.val());
				});
			});
		});
	}
}

module.exports = db;