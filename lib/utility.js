var db 	  = require('./db'),
	_  	  = require('lodash'),
	tz 	  = require("timezone");

/**
 * Takes a chunk filled with refences to data in Firebase, and overwrites the reference with data.
 * Put many chunks in, only return individual chunk in a callback one at a time.
 * @param 	{Array of Objects} 	chunks 	An array of chunks to expand.
 * @return 	{Function}			cb 		Callback function every time a chunk has been completely expanded
 */

var expandChunks = function(chunks, cb) {
	//console.log("CHUNKS START\n", chunks, "\nCHUNKS END");
	var blocksRef = new db('blocks');
	//load block references as a obj list
	blocksRef.loadAsList(function(blocks){
		//console.log("BLOCKS START\n", blocks, "\nBLOCKS END");
		
		var devicesRef = new db('devices');
		//load devices as a obj list
		devicesRef.loadAsList(function(devices){		
		
			//CHUNK LEVEL
			chunks.forEach(function(chunk, index, array) {

				_.forOwn(chunk.savedBlocks, function(savedBlock, key){
					var block = blocks[savedBlock.blockRef]
					delete block.color;
					delete block.iconClass;
					delete block.slug;
					//DEVICE LEVEL
					for (var i = 0; i < block.devicesRef.length; i++) {
						//console.log("DEVICE REF\n", block.devicesRef[i]);
						var deviceRef = block.devicesRef[i];
						
						//console.log("LEN: ", block.devicesRef.length, "ID: ", devicesRef_f, "DEVICE: ", device);
						
						if (typeof deviceRef === 'string') {
							var device = devices[deviceRef];
							delete device.settings;
							delete device.state;
							//console.log("DEVICE BUILT\n", device);
							block.devicesRef[i] = device;
							//console.log("KJHFKJDSH", block.devicesRef[i+1]);
						} else {
							console.log("deviceRef isn't a string!! Probably has already been coached. OK if it has an id:", deviceRef.id);
							//console.log(devices);
						}
					};
					// console.log("BLOCK REF BUILT\n", savedBlock.blockRef);
					// console.log("BLOCK BUILT\n", block);
					// console.log("BLOCK CHUNk\n", chunk.savedBlocks);
					chunk.savedBlocks[key].blockRef = block;
				})
				//console.log("CHUNK BUILT\n",chunk);
				cb(chunk);
			})
		})

	})
}

/**
 * Make a POST request to our prototype RasPi
 * @param 	{Object} 	raw 	Raw JSON to POST to server
 * @param 	{Function}	cb 		callback func that passes back request {Object} 'body'
 * TODO: Generalize function options
 */

var POST = function(raw, cb) {
	var request = require('request');
	prettyJSON(raw);
	var options = {
	  uri: 'http://50.174.124.132:8000/command',
	  method: 'POST',
	  json: raw
	};

	request(options, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    console.log(body.id) // Print the shortened url.
	    cb(body);
	  } else {
	  	console.log("POST error to Pi");
	  	prettyJSON({post: {error: error, body: body}});
	  }
	});
} 


/**
 * Print an object
 * @param	{Object}	obj
 */

var prettyJSON = function(obj) {
    console.log(JSON.stringify(obj, null, " "));
}

/**
 * Mob "Class"
 * This maintins a collection of database elements.
 * Requires that each {Object} 'element' contain a unique value 'id'
 */

var Mob = function() {

	/**
	 * Initialize internal collection
	 */

	var collection = [];
	
	/**
	 * Add an element to the collection
	 * @param 	{Object} 	element 	New item to add to the collection
	 * @return 	{Array}		collection 	Collection containing element
	 */

	this.add = function(element) {
		collection.push(element);
		return collection;
	}

	/**
	 * Delete an element from the collection
	 * @param 	{String} 	id 			UUID 
	 */

	this.destroy = function(id) {
		collection.forEach(function(device, index, array){
			if (device.id === id) {
				collection = collection.splice(index, 1);
			}
		});
	}

	/**
	 * Find an element in the collection by id
	 * @param 	{String} 	id 		UUID 
	 */

	this.find = function (id) {
		for (var i = 0; i < collection.length; i++) {
			if (collection[i].id === id) {
				//passing back collection reference to be able to update Mob easily.
				return collection[i];
			}
		};
		
	}

	/**
	 * Update (and overwrite) an element in the collection by id
	 * @param 	{String} 	id 		UUID 
	 * @param	{Object}	data
	 */

	this.update = function(id, data) {
		collection.forEach(function(element, index, array){
			if (element.id === id) {
				collection[index] = data;
			}
		});
	}

	/**
	 * Print information about the collection
	 */

	this.info = function() {
		console.log("Count: " + collection.length);
		for (var i = 0; i < collection.length; i++) {
			console.log("Id: ", collection[i].id);
		};
	}

	/**
	 * Find and return the 'chunk' that contains a given 'device id,' 
	 * @param 	{String} 	id 		UUID 
	 * @param	{Function}	cb 		callback function passing in the found collection {Object} element
	 * TODO: Create an inheritance structure. This is specific to the {chunkMob} and should not be {Mob}
	 */

	this.getTriggeredChunk = function(id, cb) {
		for (var i = 0; i < collection.length; i++) {
			_.forOwn(collection[i].savedBlocks, function(savedBlock, key){
				for (var k = 0; k < collection[i].savedBlocks[key].blockRef.devicesRef.length; k++) {
					//console.log(collection[i].savedBlocks[key].blockRef.devicesRef[k].id);
					if(collection[i].savedBlocks[key].blockRef.devicesRef[k].id === id && collection[i].savedBlocks[key].blockRef.sortType === 'trigger') {
						//console.log("BOUT TO CALLBACK A COLLECTION", id);
						cb(collection[i]);
					}
				};
			});
		};
	}

}

/**
 * Print out a chunk in teh console for debugging
 * @param 	{Object} 	chunk 	expanded chunk that contains devices 
 * @param	{Boolean}	raw 	choose to print the raw ugly JSON
 */

var printChunk = function(chunk, raw) {
	//WTF is this chunk doing? run to find out!
	console.log("***************************************************");
	console.log("*  chunk print time~~")
	console.log("~~~~ Actions:");
	//console.log(chunk.savedBlocks);
	_.forOwn(chunk.savedBlocks, function(savedBlock, iAction){
		var block = chunk.savedBlocks[iAction].blockRef;
		var savedSelection = chunk.savedBlocks[iAction].savedSelection;
		var savedSetting;
		if (savedSelection === false) {
			savedSetting = "waitForUser"
		} else {
			savedSetting = chunk.savedBlocks[iAction].savedSettings[savedSelection];
		}
		if (block.sortType === 'action' && block.sortCategory === 'group') {
			//console.log(block);
			console.log("~~~~~~~ " + block.name + " (" + block.sortCategory + ")");

			//count number of unique devices
			var count = 1;
			for (var qAction = 0; qAction < block.devicesRef.length; qAction++) {
				
				var device = block.devicesRef[qAction];
				var design = device.designRef;
				if (qAction < block.devicesRef.length && !!block.devicesRef[qAction + 1] && design === block.devicesRef[qAction + 1].designRef) {
					//console.log("DESIGN CHECK",design);
					count++;
				} else {
					for (var qActionCount = qAction; qActionCount < count - 1 + qAction; qActionCount++) {
						//console.log("qActioncount:",qAction," LEN:", count - 1 +qAction);
						block.devicesRef[qActionCount].count = count;	
					};
					
					var savedData;
					var savedDataToString = "";
					if (!!savedSetting.savedData) {
						savedData = savedSetting.savedData;
						//console.log("SAVED SET", savedData);
						
						for (var i = 0; i < savedData.length; i++) {
							savedDataToString += savedData[i].data + " {" + savedData[i].label + "} | ";
						};
					} else {
						savedData = savedSetting;
						savedDataToString= savedData;
					}
					console.log("~~~~~~~~~ " + device.count + "x " + savedSetting.function + ": " + savedDataToString + " (" + device.designRef + ")");
					count = 1;
				}
			}
		} else if (block.sortType === 'action' && (block.sortCategory === 'device' || block.sortCategory === 'cloud')) {
			var device = block.devicesRef[0];
			console.log("~~~~~~~ " + block.name + " (" + block.sortCategory + ")");
			var savedData;
			var savedDataToString = "";
			if (!!savedSetting.savedData) {
				savedData = savedSetting.savedData;
				//console.log("SAVED SET", savedData);
				
				for (var i = 0; i < savedData.length; i++) {
					savedDataToString += savedData[i].data + " {" + savedData[i].label + "} | ";
				};
			} else {
				savedData = savedSetting;
				savedDataToString= savedData;
			}
			
			console.log("~~~~~~~~~ " + 1 + "x " + savedSetting.function + ": " + savedDataToString + " (" + device.designRef + ")");
		}
	});

	console.log("~~~~ Triggers:");
	_.forOwn(chunk.savedBlocks, function(savedBlock, iTrigger){
		var block = chunk.savedBlocks[iTrigger].blockRef;
		var savedSelection = chunk.savedBlocks[iTrigger].savedSelection;
		var savedSetting;
		if (savedSelection === false) {
			savedSetting = "!!waitForUser";
		} else {
			savedSetting = chunk.savedBlocks[iTrigger].savedSettings[savedSelection];
		}
		
		if (block.sortType === 'trigger' && block.sortCategory === 'group') {
			//console.log(block);
			console.log("~~~~~~~ " + block.name + " (" + block.sortCategory + ")");

			//count number of unique devices
			var count = 1;
			for (var qTrigger = 0; qTrigger < block.devicesRef.length; qTrigger++) {
				
				var device = block.devicesRef[qTrigger];
				var design = device.designRef;
				if (qTrigger < block.devicesRef.length && !!block.devicesRef[qTrigger + 1] && design === block.devicesRef[qTrigger + 1].designRef) {
					//console.log("DESIGN CHECK",design);
					count++;
				} else {
					for (var qTriggerCount = qTrigger; qTriggerCount < count - 1 + qTrigger; qTriggerCount++) {
						//console.log("qTriggercount:",qTrigger," LEN:", count - 1 +qTrigger);
						block.devicesRef[qTriggerCount].count = count;	
					};
					console.log("~~~~~~~~~ " + device.count + "x " + "(methodName)" + " (" + device.designRef + ")");
					count = 1;
				}
			}
		} else if (block.sortType === 'trigger' && (block.sortCategory === 'device' || block.sortCategory === 'cloud')) {
			var device = block.devicesRef[0];
			console.log("~~~~~~~ " + block.name + " (" + block.sortCategory + ")");
			var savedData;
			var savedDataToString = "";
			if (!!savedSetting.savedData) {
				savedData = savedSetting.savedData;
				
				for (var i = 0; i < savedData.length; i++) {
					savedDataToString += savedData[i].data + " {" + savedData[i].label + "} | ";
				};
			} else {
				savedData = savedSetting;
				savedDataToString= savedData;
			}
			console.log("~~~~~~~~~ " + 1 + "x " + savedSetting.function + ": " + savedDataToString + " (" + device.designRef + ")");
		}
	});
	if(!!raw) {
		console.log("~~~~~~~~~~~~~~~~~~~THE RAW STUFF~~~~~~~~~~~~~~~~~~~");
		prettyJSON(chunk);
	}
	console.log("***************************************************");
}

var fromUTC = function(ms) {
	var us = tz(require("timezone/America"));

	console.log(us(ms, "%F %T", "America/Los_Angeles"));
	return us(ms, "%F %T", "America/Los_Angeles");
}
var toUTC = function(date) {
	var us = tz(require("timezone/America"));

	console.log(us(date, "America/Los_Angeles"));
	return us(date, "America/Los_Angeles")
}

var serverIp = function() {
	var os = require('os');
	var ifaces = os.networkInterfaces();
	var ip = [];
	for (var dev in ifaces) {
	  var alias = 0;
	  ifaces[dev].forEach(function(details){
	    if (details.family=='IPv4' && details.internal == false) {
	      ip.push(details.address);
	      ++alias;
	    }
	  });
	}
	console.log(ip[0]);
	return ip[0];
}

module.exports = {
	expandChunks: expandChunks,
	printChunk: printChunk,
	Mob: Mob,
	prettyJSON: prettyJSON,
	POST: POST,
	fromUTC: fromUTC,
	toUTC: toUTC,
	serverIp: serverIp

};

