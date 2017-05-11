var decipher = require('./decipher');
var cipher = require('./cipher');
var io = require('socket.io-client');
var cli_util = require('./client_util');
var aes_key = 'a password';

var socket = io('http://localhost:3000');
socket.on('connect', function() {
	console.log('socket connected');
});
socket.on("*", function(event, data) {
	console.log(event, data);
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
	console.log("Commandline input received:");
	console.log("\tCommand: " + result.command);
	var tokens = result.command.split(' ');
	var cmd = tokens.shift();
	socket.emit(cmd, cli_util.message[cmd](tokens));
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

for (var cmd in cli_util.handler) {
	socket.on(cmd, cli_util.handler[cmd]);
}

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