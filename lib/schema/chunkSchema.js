var mongoose = require('mongoose');

var chunkSchema = mongoose.Schema({
	triggerModifier: String,
	triggers: [{href: String, setup: {}}],
	actionModifier: String,
	actions: [{href: String, setup: {}}]
});

//Add models methods here..
chunkSchema.methods.printChunk = function () {
  console.log(this);
}

module.exports = chunkSchema;

//data coming in to store
/*{
    "id" : "1a",
    "triggerModifier" : "and", // Empty if only one trigger set, otherwise: and/or
    "triggers": [
        {
           "href" : "http://c.dev/api/devices/1",
           "set.time.relative.min" : "30",
           "set.time.ba" : "after"
        }, 
        {
           "href" : "http://c.dev/api/devices/2",
           "set.weather.type" : "cloudy"
        }
    ], 
    "actionModifier" : "", // Empty if only one action set, otherwise: and
    "actions": [
        {
           "href" : "http://c.dev/api/devices/10",
           "set.spark.function" : "doThis",
           "set.spark.data" : "pass, this, data",
        }
    ]
}*/