//make tests in here. Its basically mocha.


server.inject('/', function (res) {

    console.log(res.result);
});