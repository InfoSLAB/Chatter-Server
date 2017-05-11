var app = require('express')();
var http = require('http').Server(app);
var db = require('./db');
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
  var is_online = false;
  var username = '';
  console.log('client connected');
  // simulate TLS handshake
  // socket.on('client-hello', function() {
  // 	console.log('client hello message');
  // 	socket.emit('server-hello', { pubkey: public_key });
  // 	socket.on('client-key-exg', function(data) {
  // 		var client_key = data.key;
  // 		console.log('symmetric key: ' + client_key);
  // 		// TODO: save client key
  // 		socket.emit('server-ack', {});
  // 	});
  // });
  var challenge = parseInt(Math.random() * 10000);
  socket.on('login', function(data) {
    if (authentication({ is_online: is_online }, socket)) {
      socket.emit('login', { content: 'you are already login' });
      return ;
    }
    username = data.username;
    var user = db.getByName(username);
    if (!user) {
      socket.emit('login', { content: username + ' does not exist' });
      return ;
    }
    var pubkey = user.pubkey;
    // TODO generate aes_key
    var aes_key = 'a password';
    // TODO encrypt aes_key with user`s pubkey
    var encrypted_aes_key = aes_key;
    challenge = parseInt(Math.random() * 10000);
    // TODO encrypt challenge with aes_key
    var encrypted_challenge = challenge;
    socket.emit('login', { username: username, key: encrypted_aes_key, challenge: encrypted_challenge });
  });
  socket.on('login-ack', function(data) {
    if (authentication({ is_online: is_online }, socket)) {
      socket.emit('login', { content: 'you are already login' });
      return ;
    }
    username = data.username;
    // TODO decrypt challenge with aes_key
    var challenge_res = data.challenge;
    if (challenge_res === challenge + 1) {
      console.log(username + ' login success');
      socket.emit('login-ack', { content: username + ' login success' });
      is_online = true;
      online_users[username] = socket;
    } else {
      challenge = parseInt(Math.random() * 10000);
    }
  });
  socket.on('register', function(data) {
    if (authentication({ is_online: is_online }, socket)) {
      socket.emit('register', { content: 'please log out first' });
      return ;
    }
  	console.log('receive register', data);
  	var new_user = {};
  	new_user.email = data.email;
  	new_user.username = data.username;
  	new_user.pubkey = data.pubkey;
    new_user.friends = [];
    var r = db.save(new_user);
    socket.emit('register', { response: r });
  });
  socket.on('friend', function(data) {
    if (!authentication({ is_online: is_online }, socket) || data.sender != username) {
      console.log('friend authentication failed');
      return ;
    }
  	console.log('receive friend ', data);
    var sendername = data.sender;
    var receivername = data.receiver;
    var sender = db.getByName(sendername);
    var receiver = db.getByName(receivername);
    var type = data.type;  // (q)uery, (a)ccept, (d)eny, (l)ist
    if (type != 'l') {
      forwarding_msg(sendername, receivername, { 
        event: 'friend', 
        data: { sender: sendername, receiver: receivername, type: 'q' },
      });
    }
    switch (type) {
      case 'q':
        sender.friends.push(receivername);
        break;
      case 'd':
        // remove sender`s name from receiver`s friend list
        var index = receiver.friends.indexOf(sendername);
        if (index > -1) {
          receiver.friends.splice(index, 1);
        }
        break;
      case 'a':
        sender.friends.push(receivername);
        break;
      case 'l':
        socket.emit('friend', { sender: sendername, receivername, type: 'l', content: sender.friends });
        break;
      default:
        console.log('query type not supported');
        return ;
    }
  });
  socket.on('chat', function(data) {
    if (!authentication({ is_online: is_online }, socket) || data.sender != username) {
      console.log('chat authentication failed');
      return ;
    }
  	console.log('receive chat ' + msg);
    var sendername = data.sender;
    var receivername = data.receiver;
    var msg = data.content;
    if (check_user_online(sendername) && check_user_online(receivername)) {
      forwarding_msg(sendername, receivername, { event: 'chat', data: { sender: sendername, content: msg } });
    } else {
      socket.emit('chat', { content: 'sorry, ' + receivername + ' is offline.' });
    }
    // TODO forward message to receiver
  });
  socket.on('file', function(data) {
    if (!authentication({ is_online: is_online }, socket))
      return ;
  	console.log('receive file ' + msg);
    var sendername = data.sender;
    var receivername = data.receiver;
    var file = data.content;
    // TODO ...
  });
  socket.on('disconnect', function() {
    for (var username in online_users) {
      if (online_users[username] === socket) {
        console.log(username + " left");
        delete online_users[username];
      }
    }
  	console.log('client disconnected');
  });
  // socket.emit('test server send', { hello: 'world' });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});

var online_users = {}
function forwarding_msg(snd_nm, recv_nm, packet) {
  var sndr_sock = online_users[snd_nm];
  var recr_sock = online_users[recv_nm];
  var event = packet.event;
  var data = packet.data;
  recr_sock.emit(event, data);
}

function check_user_online(username) {
  return username in online_users;
}

function authentication(prereq, socket) {
  var is_online = prereq.is_online;
  if (!is_online) {
    console.log('client request not online');
    socket.emit('au-error', { reason: 'client not logged in!' });
    return false;
  }
  return true;
}