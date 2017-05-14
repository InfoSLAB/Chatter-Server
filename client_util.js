var cipher = require('./cipher');
var decipher = require('./decipher');

module.exports = {
	handler: {
		login: function(data, user) {
			console.log(data);
			var username = data.username;
			var key = data.key;
			var challenge = data.challenge;
			var cha_res = data.cha_res;
			var aes_key = 'empty';
			try {
				aes_key = decipher.rsa_priv(key, user.privkey);
			} catch (ex) {
				console.log('error decrypting session key. Please offer the correct user key.');
				return ;
			}
			console.log('session key:', aes_key);
			user.session_key = aes_key;
			var cha_res_plain = decipher.aes(cha_res, aes_key);
			if (cha_res_plain != user.my_challenge + 1) {
				console.log('response:', cha_res_plain);
				console.log('challenge:', user.my_challenge);
				console.log('server challenge fail.');
				return ;
			}
			var challenge_plain = decipher.aes(challenge, aes_key);
			user.server_challenge = challenge_plain;
			console.log('server_challenge:', challenge_plain);
		},
		'login-ack': function(data, user) {
			console.log(data);
		},
		register: function(data, user) {
			console.log(data);
		},
		friend: function(data, user) {
			var aes_key = user.session_key;
			console.log(JSON.parse(decipher.aes(data, aes_key)));
		},
		chat: function(data, user) {
			var aes_key = user.session_key;
			console.log(JSON.parse(decipher.aes(data, aes_key)));
		}
	},
	message: {
		login: function(tokens, user) {
			var challenge = parseInt(Math.random() * 10000);
			console.log('my challenge:', challenge);
			var enc_challenge = cipher.rsa_pub(challenge.toString(), user.server_pubkey);
			user.my_challenge = challenge;
			return {
				username: tokens[0],
				challenge: enc_challenge,
			}
		},
		'login-ack': function(tokens, user) {
			var session_key = user.session_key;
			var enc_challenge = cipher.aes(tokens[1].toString(), session_key.toString());
			return {
				username: tokens[0],
				challenge: enc_challenge,
			}
		},
		register: function(tokens, user) {
			return {
				email: tokens[0],
				username: tokens[1],
				pubkey: tokens[2],
			}
		},
		friend: function(tokens, user) {
			var aes_key = user.session_key;
			return cipher.aes(JSON.stringify({
				sender: tokens[0],
				receiver: tokens[1],
				type: tokens[2],  // (q)uery, (a)ccept, (d)eny, (l)ist
			}), aes_key);
		},
		chat: function(tokens, user) {
			var aes_key = user.session_key;
			return cipher.aes(JSON.stringify({
				sender: tokens.shift(),
				receiver: tokens.shift(),
				content: tokens.join(' '),
			}), aes_key);
		}
	}
}

module.exports.load_user = function(username) {
	var fs = require('fs');
	var privkey = fs.readFileSync(__dirname + '/' + username, 'utf8');
	var pubkey = fs.readFileSync(__dirname + '/' + username + '.pub', 'utf8');
	var server_pubkey = fs.readFileSync(__dirname + '/id_rsa.pub', 'utf8');
	return {
		username: username,
		pubkey: pubkey,
		privkey: privkey,
		server_pubkey: server_pubkey,
	}
}

// console.log(load_user('joker'));
// console.log(load_user);