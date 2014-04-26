var Insteon = require('home-controller').Insteon;

var gw = new Insteon();
gw.connect('10.0.1.66', function(){
	console.log('Connected!');

	// gw.level('29F281', function(error, level){
	//     console.log(level); // Should print 50
	// });

	// Set light level
	gw.level('29F281', 0, function(error) {
	});
});

// gw.checkStatus(function(error, info) {
// 	console.log(info);
// 	console.log(error);
// });

