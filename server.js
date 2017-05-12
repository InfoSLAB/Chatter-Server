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
  var aes_key = '';
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
    var client_challenge = decipher.rsa_priv(data.challenge, server_privkey);
    console.log('client_challenge:', client_challenge);
    var cli_cha_resp = parseInt(client_challenge, 10) + 1;
    var user = db.getByName(username);
    if (!user) {
      socket.emit('login', { content: username + ' does not exist' });
      return ;
    }
    var pubkey = user.pubkey;
    // TODO generate aes_key
    aes_key = cipher.aes_gen_key();
    console.log('aes_key:', aes_key);
    // TODO encrypt aes_key with user`s pubkey
    var encrypted_aes_key = cipher.rsa_pub(aes_key, pubkey);
    challenge = parseInt(Math.random() * 10000);
    // TODO encrypt challenge with aes_key
    cipher.aes(challenge.toString(), aes_key, function(enc_challenge) {
      cipher.aes(cli_cha_resp.toString(), aes_key, function(enc_cli_cha_res) {
        socket.emit('login', { username: username, key: encrypted_aes_key, challenge: enc_challenge, cha_res: enc_cli_cha_res });
      });
    });
  });
  socket.on('login-ack', function(data) {
    if (authentication({ is_online: is_online }, socket)) {
      socket.emit('login', { content: 'you are already login' });
      return ;
    }
    if (!data.username || !data.challenge) {
      console.log('broken packet');
      challenge = parseInt(Math.random() * 10000);
      return;
    }
    username = data.username;
    // TODO decrypt challenge with aes_key
    var challenge_res = decipher.aes(data.challenge.toString(), aes_key, function(challenge) {
      if (challenge_res === challenge + 1) {
        console.log(username + ' login success');
        socket.emit('login-ack', { content: username + ' login success' });
        is_online = true;
        online_users[username] = socket;
      } else {
        challenge = parseInt(Math.random() * 10000);
      }
    });
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

var server_pubkey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAg//il5Vo+NQm7g2DE8JC
nAXsJUxNVHB9LsZ1i3FuMdXlKUMC28neKJfOSAUOaf1r/4iazcac1iBOAEIGrqs5
IuqDfWDoSnFR8aMGsh+rzurPCoTu0sM0VuRpTvDwnEn0lg+MXjvdkKUR+kuZ01cS
pvvVRzv43Rtv+l60M4gHY0/m/5GqhyIi5uIgRMnIq+ICPKxauksR0OhuhRDkmGDl
Nuhr/sdrEfUT/qe7N1VCHbgno0dQLnZh5Q8dZSIZGYXqt02HLEVFBbLU1fLlZQSE
KM0b9RS/BgiUEZqQw7T+/J8SGd9tbfs2RED9ewiBAdWjyxvnS2/ZfIDA4UG2/70c
+QIDAQAB
-----END PUBLIC KEY-----`;

var server_privkey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCD/+KXlWj41Cbu
DYMTwkKcBewlTE1UcH0uxnWLcW4x1eUpQwLbyd4ol85IBQ5p/Wv/iJrNxpzWIE4A
Qgauqzki6oN9YOhKcVHxowayH6vO6s8KhO7SwzRW5GlO8PCcSfSWD4xeO92QpRH6
S5nTVxKm+9VHO/jdG2/6XrQziAdjT+b/kaqHIiLm4iBEycir4gI8rFq6SxHQ6G6F
EOSYYOU26Gv+x2sR9RP+p7s3VUIduCejR1AudmHlDx1lIhkZheq3TYcsRUUFstTV
8uVlBIQozRv1FL8GCJQRmpDDtP78nxIZ321t+zZEQP17CIEB1aPLG+dLb9l8gMDh
Qbb/vRz5AgMBAAECggEAK4DGzgx41yEcX3Jmk7l/OGqfRD+ccMrOBv9zN+y/U39a
Ejo6k/M424oEeynncTkLQeFkm5Lsl4l4C4+3IhPeNcqyYTzx8a7dQdTn3QahGgW7
DI15JE8fTc/jgRfZRLj++gHP0jLKt+QfQ61s2gElbZEr3lk+kKh9RDe4Dg+z15+7
Ph0trE12xVolHr8TPtiNQqfBdo/Np+dSuMZu6oEkgOBku8ttPI3jBSbt3T5NMiXl
ggrBPMZ+1slPDQ1PaJyLfiabTMoDD/UlvaRsiHfUr++K1rbHp99XQaisz2KuGhjA
UkrULXTtaR3OaKvG0aldS39FGxT4yl87tg3ThexgcQKBgQD+JSzkSVvTxGQCU9g0
03ZMOfX9Cx3NcsJWPlz6HkY+ndSO49QDG0VVGPdXWbsoe6wTgYzQD33+AaMgqCfd
FrDQ5+hXiX+ll3TK8Pa1rs7/muQk5DHcHw32hoJu8KxV8khiqqtRATgCp+lQXG4d
P2MxKvSz2/xZMrmajThSXDVBpQKBgQCE9oCnXC+wHP5/Hsxcb7UKX5+GZL2XVoox
Ws15Ljx3MClPLrHr1WpUy0hQYNRrq4QivBE+sH9JdESsvfgDNx0phKcgo0ouiXDs
sVGLl8SM+/HqlRSjab8dZSraddgtn71ntAFFQMPg9qGqIIhnXo2H8BdDnx7gYiVs
N+2jypXlxQKBgD+c5oOtqQJ0oePDQNbYJ0AlMeFIqwkFtIcJzRP+B+8calvpwuOU
K+KFAUQn/aTAb+3h+3EIr6yolEBUVsYMK+3eXlWq4Px90IoLjnUjcESibICfbat/
Smtud691Jm3M2zl3JrJ7750akle/CwDfIODps55hbeSVwcdhmbtjwSDRAoGAR9Ym
jEVyPmRr26J4JzjzRzeCqMmk5S8MWr4EZYRlhr+ukelYl2ImoMlzuHmYStPQADQ7
3PLe0oDO2cWJSbNtPhE9epS+b4YyTK9Ar3q/5qv4eBUzoVZwuyD9lio1MfEsE+td
BF2JdvHJRnFtQOwE63z8FLzTocdlEKLm8adydUECgYEAjagImI25z6ydjBdsCCE/
lTlg4YMvP3URSMNMNq3faeT0t9Nvd/qrfJx+2OYihb89V+sF+9YM/ycGJN0iFIw8
ahl8ZaUpFHWNi1rMuYRzBsjhh16eVRhnaiE37MRt9EL7H0Gf4ETsdoI/fJW5dBS1
Wtse7sTZ+I/jif9IkR8o3bk=
-----END PRIVATE KEY-----`;