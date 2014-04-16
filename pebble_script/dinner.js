simply.title('Clyde');
simply.subtitle('sleep?');
simply.on('singleClick', function(e) {
  if (e.button === 'select') {
    ajax({ url: 'http://192.168.0.110:8000/demo/sleep' }, function(data){
	  simply.subtitle(data);
	});
  } 
});


