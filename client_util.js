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
			decipher.aes(cha_res, aes_key, function(cha_res_plain) {
				if (cha_res_plain != user.my_challenge + 1) {
					console.log('response:', cha_res_plain);
					console.log('challenge:', user.my_challenge);
					console.log('server challenge fail.');
					return ;
				}
				decipher.aes(challenge, aes_key, function(challenge_plain) {
					user.server_challenge = challenge_plain;
					console.log(challenge_plain);
				});
			});

		},
		'login-ack': function(data, user) {
			console.log(data);
		},
		register: function(data, user) {
			console.log(data);
		},
		friend: function(data, user) {
			console.log(data);
		},
		chat: function(data, user) {
			console.log(data);
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
			return {
				username: tokens[0],
				challenge: parseInt(tokens[1], 10),
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
			return {
				sender: tokens[0],
				receiver: tokens[1],
				type: tokens[2],  // (q)uery, (a)ccept, (d)eny, (l)ist
			}
		},
		chat: function(tokens, user) {
			return {
				sender: tokens.shift(),
				receiver: tokens.shift(),
				content: tokens.join(' '),
			}
		}
	}
}
