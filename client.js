var decipher = require('./decipher');
var cipher = require('./cipher');
var io = require('socket.io-client');
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
	command_mapper = {
		'login': {
			username: tokens[0],
		},
		'login-ack': {
			username: tokens[0],
			challenge: parseInt(tokens[1], 10),
		},
		'register': {
			email: tokens[0],
			username: tokens[1],
			pubkey: tokens[2],
		},
		'friend': {
			sender: tokens[0],
			receiver: tokens[1],
			type: tokens[2],  // (q)uery, (a)ccept, (d)eny, (l)ist
		},
		'chat': {
			sender: tokens.shift(),
			receiver: tokens.shift(),
			content: tokens.join(' '),
		}
	}
	var data = command_mapper[cmd];
	socket.emit(cmd, data);
	// cipher.aes(data, aes_key, (encrypted) => {
		// socket.emit(cmd, encrypted);
	// });
	// socket.emit(cmd, data);
	prompt.get(['command'], (err, result) => processInput(err, result));
}

commands.forEach(cmd => {
	console.log('register:', cmd);
	socket.on(cmd, function(data) {
		console.log(data);
	});
});

function onErr(err) {
	console.log(err);
	return;
}

function onQuit(result) {
	socket.disconnect();
	console.log(result);
}