simply.title('Clyde');
simply.subtitle('sleep?!');
simply.on('singleClick', function(e) {
  if (e.button === 'select') {
    ajax({ url: 'http://192.168.1.74:8000/trigger/sleep' }, function(data){
	  simply.subtitle(data);
	});
  } 
});


