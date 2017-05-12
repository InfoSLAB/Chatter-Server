var decipher = require('./decipher');
var cipher = require('./cipher');
var io = require('socket.io-client');
var cli_util = require('./client_util');
var aes_key = 'a password';

var socket = io('http://localhost:3000');
socket.on('connect', function() {
	console.log('socket connected');
});
var prompt = require('prompt');

prompt.start();
prompt.get(['command'], (err, result) => processInput(err, result));

var username;
var commands = ['login', 'login-ack', 'register', 'friend', 'chat', 'file'];
function processInput(err, result) {
	if (err) { return onErr(err); }
	if (result.command === 'quit') {
		onQuit(result);
		return;
	}
	// console.log("Commandline input received:");
	// console.log("\tCommand: " + result.command);
	var tokens = result.command.split(' ');
	var cmd = tokens.shift();
	socket.emit(cmd, cli_util.message[cmd](tokens, user));
	// command_mapper = {
	// 	'login': {
	// 		username: tokens[0],
	// 	},
	// 	'login-ack': {
	// 		username: tokens[0],
	// 		challenge: parseInt(tokens[1], 10),
	// 	},
	// 	'register': {
	// 		email: tokens[0],
	// 		username: tokens[1],
	// 		pubkey: tokens[2],
	// 	},
	// 	'friend': {
	// 		sender: tokens[0],
	// 		receiver: tokens[1],
	// 		type: tokens[2],  // (q)uery, (a)ccept, (d)eny, (l)ist
	// 	},
	// 	'chat': {
	// 		sender: tokens.shift(),
	// 		receiver: tokens.shift(),
	// 		content: tokens.join(' '),
	// 	}
	// }
	// var data = command_mapper[cmd];
	// socket.emit(cmd, data);
	prompt.get(['command'], (err, result) => processInput(err, result));
}

// TODO load user...
var user = {
	email: 'fd0joker@gmail.com',
    username: 'joker',
    pubkey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjI4qXazuSMTgLgj8eE/o
eAQQ/r0RFPeckfiW+zoYKmA5gbRf1IPcVi6ltDTmAxKiz9fO9KQmIQbvzhCaqW3F
qOSABx9obB9Duh2DVY7rL3VZCL75CKNr6HHahuPvpW13iPrkZjEM9Hh/jl0KUDWV
fp8amJ/adpcTRo3vwovhdaMv64JLfg/Rpl6A8z+3HExW3UfSLS5R3aWbEGfnMXY8
jJ+QWAsyilE7LW0b3mZ9KLlQKtfUcDYZGdL5KykcH4rlpg9OsgulhZrjPj+nUq0M
eEl35LriV4afjo2/Hp/mo1LxG5+tScXItqpvx67pYE3bHnVOT/qZcN/KoFDQ7EWm
5QIDAQAB
-----END PUBLIC KEY-----`,
	privkey: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCMjipdrO5IxOAu
CPx4T+h4BBD+vREU95yR+Jb7OhgqYDmBtF/Ug9xWLqW0NOYDEqLP1870pCYhBu/O
EJqpbcWo5IAHH2hsH0O6HYNVjusvdVkIvvkIo2vocdqG4++lbXeI+uRmMQz0eH+O
XQpQNZV+nxqYn9p2lxNGje/Ci+F1oy/rgkt+D9GmXoDzP7ccTFbdR9ItLlHdpZsQ
Z+cxdjyMn5BYCzKKUTstbRveZn0ouVAq19RwNhkZ0vkrKRwfiuWmD06yC6WFmuM+
P6dSrQx4SXfkuuJXhp+Ojb8en+ajUvEbn61Jxci2qm/HrulgTdsedU5P+plw38qg
UNDsRablAgMBAAECggEAI1GF68wMhFSUUH0Jk+HgdGfxLVGs/SvLOBLTPYW3lM5h
JOqCOhB4SV+nW8T/Fz6Tks6Tvn2Q5zOrBoi9lF11EZ95XFDUGHcyuY249sLW7jH6
kWwLf9QwxVP2qXaVPWhoZQ9GXTduHfA5fTh74vPUAOFR+ZARgUMtIMmBuc0Udk6N
Ae0/XvSbU+dV3f65AiSIVGwT9ZKfH6lPuURx48JTWIlSRqESgrf3DQ66uPZQ+Ji3
C64j7L5Mx4ThLH1sEyfEo+K46/JoAvAH7uLcSF+k23y2MqbMbuIcw5WOd6EQSbyw
o31/opHwyqzhd94G/+2fRR0uUb1hh8bvNiaeOieBgQKBgQDyZsdo7Ome3Yd/lBJb
nFog+IGyqwWLUMkEQY324Ym4gL/ZYmfdkGkcfsjx9f3gU4biQBaiaY+PDN2Nniyp
w43YRlg8CnFxHkyJkYsRILTiWvPEr+mYhUyZJrQxnAy+6DdhGknQ4tdS4qwRZ05A
LBBi03+c5B6CdreIqucmzoeMyQKBgQCUcLwbxUHlTH+NEn+jff6bu0rvqlmzjKsa
OA8tzmWooGoWGPeR2tb+FVZBC0axnkPIkjCxRBz4hLGhwF6fPsQJBs5Q6zQqfu8r
HiSGmYCSKEEXg7XBnkQKq3eF97tDa5ANm8KhJG9vGltTy0ZgPDCMdYv+ax5DC69k
o43JMdzDPQKBgQCG3ZZPE5k70Ydk/Q5luA0RURJgRPT1uUHOQ2boGD4W0FNtcGnX
hVRmDUhiDvpsiCyAzyWIwXClJ4RRGdNBtNLDpQfMiAbr5+6vj7GvGuJpGi+MnE88
k9W1VCpne6o/wVWmigjN1pf0vrb7i92mqJ2JTqEuumEbN1AQEv4+wiP6uQKBgQCE
9iIYwe0PhiEubOZ1vLLmLbKm0LD+mj7dAl/eSOVYUTAVURHYzOwMtXIIWyBckwXm
T8Rb1EYa+UjfOR/IhoE0EKuXYcbdVcvHlH1lL3Qx9uqvNGQG5UvPPt2V21wavOtQ
tTd1/dvu6e3qNcd5BhD6j4PxRWPa7EmT3Mhw8j/rhQKBgGRQMeFUrtS5HHAOxX/y
xhESLA/j1p/SQymBvnMBZtNEJDlfxpQsmSRS5ftnLq9se/eVy6aFpY5qR3OPRwCn
lMbVsqdGcvpr4DQ3VsngqiBy1pzNQtKXToT8gkF0OaFsJBEErF+YJdhtBV7uB48U
p/r5/DL9qNZlbj7qnWq05PcD
-----END PRIVATE KEY-----`,
	server_pubkey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAg//il5Vo+NQm7g2DE8JC
nAXsJUxNVHB9LsZ1i3FuMdXlKUMC28neKJfOSAUOaf1r/4iazcac1iBOAEIGrqs5
IuqDfWDoSnFR8aMGsh+rzurPCoTu0sM0VuRpTvDwnEn0lg+MXjvdkKUR+kuZ01cS
pvvVRzv43Rtv+l60M4gHY0/m/5GqhyIi5uIgRMnIq+ICPKxauksR0OhuhRDkmGDl
Nuhr/sdrEfUT/qe7N1VCHbgno0dQLnZh5Q8dZSIZGYXqt02HLEVFBbLU1fLlZQSE
KM0b9RS/BgiUEZqQw7T+/J8SGd9tbfs2RED9ewiBAdWjyxvnS2/ZfIDA4UG2/70c
+QIDAQAB
-----END PUBLIC KEY-----`,
    friends: [
        'jiji',
    ],
}

// for (var cmd in cli_util.handler) {
// 	console.log('register listener for cmd:', cmd)
// 	socket.on(cmd, function(data) {
// 		console.log('response of', cmd);
// 		cli_util.handler[cmd](data, user);
// 	});
// }

socket.on('login', function(data) {
	cli_util.handler['login'](data, user);
});

socket.on('login-ack', function(data) {
	cli_util.handler['login-ack'](data, user);
});

socket.on('register', function(data) {
	cli_util.handler['register'](data, user);
});

socket.on('friend', function(data) {
	cli_util.handler['friend'](data, user);
});

socket.on('chat', function (data) {
	cli_util.handler['chat'](data, user);
});

// cli_util.handler.forEach(cmd => {
// 	console.log('register:', cmd);
// 	socket.on(cmd, function(data) {
// 		console.log(data);
// 	});
// });

function testCrypto() {
	// keyPair = cipher.rsa_gen_key_pair();
	// cipher.rsa_pub('hahaha', keyPair.pubkey, function(enc) {
	// 	decipher.rsa_priv(enc, keyPair.privkey, console.log);
	// });
	// cipher.rsa_priv('hahahaha', keyPair.privkey, function(enc) {
	// 	decipher.rsa_pub(enc, keyPair.pubkey, console.log);
	// });

	// var fs = require('fs');
	// fs.writeFile('./jiji.pub', keyPair.pubkey);
	// fs.writeFile('./jiji', keyPair.privkey);
}

testCrypto();

function onErr(err) {
	console.log(err);
	return;
}

function onQuit(result) {
	socket.disconnect();
	console.log(result);
}