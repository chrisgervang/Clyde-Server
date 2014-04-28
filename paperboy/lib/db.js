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
}

module.exports = db;