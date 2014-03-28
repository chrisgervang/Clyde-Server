var nano    = require('nano')('http://localhost:5984'),
	db_name = "clyde"
	db      = nano.use(db_name);

var load = function (request, reply) {
	//var chunks;
	//TODO: add doc name to every insert so we can look up by docname. in nano documentation.
	// db.list(function(err, body, header) {
	// 	reply(err,body,header);
	// });
	var experiences_json = [];
	/*
	TODO: do this cleaner - make helper functions to make db requests and return the result in cb
	-solves db scope issue
	-then we have methods that will return all body's of each db.
	-then we have methods that will return a body from an _id.
	*/
	db      = nano.use('experiences');
	//fetch all experiences
	db.list(function(err, body, header){
		//go through all experience id's
		body.rows.forEach(function(row, ex_index, array){
			//fetch experience body's from id's
			db.get(row.id, function(err, experience, header){
				console.log(experience);
				experiences_json[ex_index]= experience;
				
				experience.chunks.forEach(function(chunk, ch_index, array){
					var chunkID = chunk.href.split('/chunks/');
					chunkID = chunkID[1];
					db = nano.use('chunks');
					
					db.get(chunkID, function(err, chunk, header) {
						// console.log("EXJSON", experiences_json[ex_index].chunks[ch_index]);
						// console.log("CUNK", chunk);
						experiences_json[ex_index].chunks[ch_index] = chunk;	

						//in parallel, grab triggers and actions
						chunk.triggers.forEach(function(trigger, tr_index, array){
							var triggerID = trigger.href.split('/devices/');
							triggerID = triggerID[1];
							db = nano.use('devices');
							db.get(triggerID, function(err, trigger, header) {
								experiences_json[ex_index].chunks[ch_index].triggers[tr_index] = trigger;

								chunk.actions.forEach(function(action, ac_index, array){
									var actionID = action.href.split('/devices/');
									actionID = actionID[1];
									db = nano.use('devices');
									db.get(actionID, function(err, action, header) {
										experiences_json[ex_index].chunks[ch_index].actions[ac_index] = action;
										//console.log("ACTION", action);
										//TODO: make this run by callback............. or just make it happen after triggers.
										reply({experiences: experiences_json});
							});
						});
							});
						});

					});
				});
			});
		});
	});
};

module.exports = load;