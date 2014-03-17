//make tests in here. Its basically mongo.


server.inject('/', function (res) {

    console.log(res.result);
});