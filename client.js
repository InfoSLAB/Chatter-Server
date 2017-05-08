// var decipher = require('./decipher');
// var cipher = require('./cipher');
var io = require('socket.io-client');
// var readline = require('readline');
// var aes_key = 'a password';
// var host = 'localhost';
// var port = 3000;

var socket = io('http://localhost', {
	port: 3000
});
socket.on('connect', function() {
	console.log('socket connected');
});
socket.emit('register', 'hello');
socket.disconnect();

// const rl = readline.createInterface({
	// input: process.stdin,
	// output: process.stdout
// });

// rl.question('What do you want?\n', (answer) => {
	// var tokens = answer.split(' ');
	// var command = tokens[0];
	// tokens.shift();
	// console.log(`command: ${command}, param: ${tokens.join(' ')}`)
	// socket.emit(command, tokens.join(' '));
	// console.log('finished');
	// rl.close();
// });