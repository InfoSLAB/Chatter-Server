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
	prompt.get(['command'], (err, result) => processInput(err, result));
}

var username = process.argv[2];
var user = cli_util.load_user(username ? username : 'joker');
console.log('load user:', user.username);

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

function onErr(err) {
	console.log(err);
	return;
}

function onQuit(result) {
	socket.disconnect();
	console.log(result);
}