var trigger = function(request, reply) {
	if (request.params.type == "experience") {
		var exId = request.payload._id; 
		//TODO: add experience database and a view to construct chunks from experience id
		var experience = {
			_id: exId,
			chuncks: [
				{
					_id: "9347287627468" //fake
				},{
					_id: "8374982797498" //fake
				}
			];
		}

		experience.chuncks.forEach(function(chunk, index, array) {
			db.get({_id: chunk._id}, function(err, body, header) {
				reply(body);
			});
		});
	}
}

module.exports = trigger;