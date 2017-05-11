var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 3000;

var decipher = require('./decipher');
var cipher = require('./cipher');
var aes_key = 'a password';
var public_key = 'server public key';

var user = require('./user').createUser;
var user_list = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// app.get('/bundle.js', function(req, res) {
// 	res.sendFile(__dirname + '/bundle.js');
// });

io.on('connection', function(socket){
	console.log('client connected');
	// for communication with demo client
  socket.on('chat message', function(msg){
  	// decipher.aes(msg, aes_key, function(plain) {
  		// var encrypted = cipher.aes(plain, aes_key);
  		// io.emit('chat message', encrypted);
  		io.emit('chat message', msg);
  	// });
  });
  // simulate TLS handshake
  socket.on('client-hello', function() {
  	console.log('client hello message');
  	socket.emit('server-hello', { pubkey: public_key });
  	socket.on('client-key-exg', function(data) {
  		var client_key = data.key;
  		console.log('symmetric key: ' + client_key);
  		// TODO: save client key
  		socket.emit('server-ack', {});
  	});
  });
  socket.on('register', function(data) {
  	console.log('receive register ' + data);
  	var new_user = {};
  	new_user.email = data.email;
  	new_user.username = data.username;
  	new_user.pubkey = data.pubkey;
  	// socket.emit('register', { user: username, id: 1 });
  });
  socket.on('friend', function(data) {
  	console.log('receive friend ' + data);
  });
  socket.on('chat', function(msg) {
  	console.log('receive chat ' + msg);
  });
  socket.on('file', function(msg) {
  	console.log('receive file ' + msg);
  });
  socket.on('disconnect', function() {
  	console.log('client disconnected');
  });
  socket.emit('test server send', { hello: 'world' });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});