var spark = require('sparknode');
var Action = {
	spark: function(method, data) {
		console.log(data);
		var core = new spark.Core(data.accessToken, data.deviceID);
		
		core[data.func](data.params, function(err, data) {
			console.log(data);
		});
	},
	hue: function(method, data) {

	}
}

module.exports = Action;