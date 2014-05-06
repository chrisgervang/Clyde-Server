var Firebase = require('firebase');
var _ = require('lodash');

var db = function(root) {
	this.root = new Firebase('https://clydedev.firebaseio.com/' + root);

	this.load = function(cb) {
		//console.log(this);
		var elements = [];
		var that = this;
		that.root.once('value', function(snapshot){
			//console.log(snapshot.val());
			var eleCount = _.size(snapshot.val());
			var count = 0;
			that.root.on('child_added', function(snapshot){
				elements.push(snapshot.val());

				count++;
				//console.log(eleCount, count);
				if (count >= eleCount) {
					cb(elements);
				}
			});
			
		});
	}
	this.loadAsList = function(cb) {
		var that = this;
		that.root.once('value', function(snapshot) {
			cb(snapshot.val());
		})
	}
}

module.exports = db;