var decipher = require('./decipher');
var cipher = require('./cipher');
var io = require('socket.io-client');
var aes_key = 'a password';

var socket = io('http://localhost:3000');
socket.on('connect', function() {
	console.log('socket connected');
});
var prompt = require('prompt');

prompt.start();
prompt.get(['command'], (err, result) => processInput(err, result));

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
	var data = tokens.join(' ');
	cipher.aes(data, aes_key, (encrypted) => {
		socket.emit(cmd, encrypted);
	});
	// socket.emit(cmd, data);
	prompt.get(['command'], (err, result) => processInput(err, result));
}

function onErr(err) {
	console.log(err);
	return;
}

function onQuit(result) {
	socket.disconnect();
	console.log(result);
}