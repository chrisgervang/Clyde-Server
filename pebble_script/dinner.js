simply.title('Clyde@Home');
simply.subtitle('dinner?');
simply.on('singleClick', function(e) {
  if (e.button === 'select') {
    ajax({ url: 'http://localhost:8000/trigger/dinner' }, function(data){
	  simply.subtitle(data);
	});
  } 
});


