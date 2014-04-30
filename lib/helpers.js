var db = require('./db');

var Catcher = function() {
	var chunksRef = new db('blocks');
	chunksRef.load(function(elements){
		console.log(elements);
	});

	/*chunksRef.add({
		"deviceRef" : [ "8" ],
      "iconClass" : "fa-calendar-o",
      "type" : "trigger",
      "color" : "222",
      "category" : "cloud",
      "name" : "Date",
      "slug" : "date"
	}, function(element){
		console.log("ADDED:", element);
	})*/
}

module.exports = {Catcher: Catcher};