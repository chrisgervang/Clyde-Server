var Action = require('../Action.js'),
	nano    = require('nano')('http://localhost:5984'),
	db_name = "clyde",
	db      = nano.use(db_name);

var trigger = function(request, reply) {
	if (request.params.type == "experience") {
		var exId = request.payload._id; 
		//TODO: add experience database and a view to construct chunks from experience id
		db.get(exId, function(err, experience, header){
			experience.chuncks.forEach(function(chunk, index, array) {
				db.get(chunk._id, function(err, body, header) {
					console.log(body.actions[0], err, header);
					/*{
		              "href" : "http://c.dev/api/devices/10",
		              "set.spark.function" : "doThis",
		              "set.spark.data" : "pass, this, data"
		            }*/
		            var actionKeys = Object.keys(body.actions[0]);
		            console.log(actionKeys);
		            var actions = body.actions[0];
		            if (actionKeys[1].indexOf("set\.spark") != -1) {
		            	console.log("trueeee");
		            	var sparkAction = {
		            		func: actions['set.spark.function'],
		            		params: actions['set.spark.data'],
		            		deviceID: '48ff6e065067555050192387',
		            		accessToken: '427016082e1adc9172f7e6c32e810a26bcc6ebd8'
		            	} 
		            	Action.spark('func', sparkAction)
		            } else if(false) {
		            	//another device
		            } else {
		            	//another device
		            }
				});
			});
		});

		// var experience = {
		// 	_id: exId,
		// 	chuncks: [
		// 		{
		// 			_id: "7d19e6f76396907c869792288800095d"
		// 		},{
		// 			_id: "7d19e6f76396907c8697922888001762"
		// 		}
		// 	]
		// }

		
	}
}

module.exports = trigger;