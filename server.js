var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var decipher = require('./decipher');
var cipher = require('./cipher');
var aes_key = 'a password';

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/bundle.js', function(req, res) {
	res.sendFile(__dirname + '/bundle.js');
});

io.on('connection', function(socket){
	// for communication with demo client
  socket.on('chat message', function(msg){
  	decipher.aes(msg, aes_key, function(plain) {
  		var encrypted = cipher.aes(plain, aes_key);
  		io.emit('chat message', encrypted);
  	});
  });
  socket.on('register', function(msg) {
  	console.log('receive register msg');
  });
  socket.on('friend', function(msg) {
  	console.log('receive friend msg');
  });
  socket.on('chat', function(msg) {
  	console.log('receive chat msg');
  });
  socket.on('file', function(msg) {
  	console.log('receive file msg');
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});

// decipher.aes('ca981be48e90867604588e75d04feabb63cc007a8f8ad89b10616ed84d815504', 'a password', console.log);
// cipher.aes('some clear text data', 'a password', console.log);