simply.title('Clyde@Home');
simply.subtitle('dinner?');
simply.on('singleClick', function(e) {
  ajax({ url: 'http://192.168.1.74:8000/trigger/dinner' }, function(data, err){
    simply.subtitle(data);
    if(err) {
    	simply.subtitle(err);
    }
  });
});


