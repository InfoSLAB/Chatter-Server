const crypto = require('crypto');
var NodeRsa = require('node-rsa');
var ursa = require('ursa');
var rstr = require('randomstring');

module.exports = {
	aes_gen_key: function() {
		return rstr.generate(10);
	},
	aes: function(plain, key) {
		const cipher = crypto.createCipher('aes192', key);
		let encrypted = '';
		cipher.on('readable', () => {
			const data = cipher.read();
			if (data)
				encrypted += data.toString('hex');
		});
		var flag = false;
		cipher.on('end', () => {
			flag = true;
		});
		cipher.write(plain);
		cipher.end();
		while (!flag) {
			require('deasync').runLoopOnce();
		}
		return encrypted;
	},
	rsa_gen_key_pair: function() {
		var key_pair = new NodeRsa({b: 256});
		var privKeyStr = key_pair.exportKey('pkcs8-private-pem');
		var pubKeyStr = key_pair.exportKey('pkcs8-public-pem');
		return {
			pubkey: pubKeyStr,
			privkey: privKeyStr,
		}
	},
	rsa_pub: function(plain, pubPem) {
		var key = ursa.createPublicKey(pubPem);
		var encrypted = key.encrypt(plain, 'utf8', 'base64');
		return encrypted;
	},
	rsa_priv: function(plain, priPem) {
		var key = ursa.createPrivateKey(priPem);
		var encrypted = key.privateEncrypt(plain, 'utf8', 'base64');
		return encrypted;
	},
}

// var cipher = require('./cipher');
// var decipher = require('./decipher');
// console.log(decipher.aes(cipher.aes('hahahaha', 'pass'), 'pass'));

// var key = new NodeRsa({b: 512});
// var privKeyStr = (key.exportKey('pkcs8-private-pem'));
// var pubKeyStr = (key.exportKey('pkcs8-public-pem'));

// // var key1 = new NodeRsa();
// // key1.importKey(privKeyStr, 'pkcs8');
// var key1 = ursa.createPrivateKey(privKeyStr);
// var key2 = ursa.createPublicKey(pubKeyStr);


// var enc = key2.encrypt('hahaha', 'utf8', 'base64');
// var dec = key1.decrypt(enc, 'base64', 'utf8');
// console.log(enc);
// console.log(dec.toString());

// var enc = key1.privateEncrypt('hahaha', 'utf8', 'base64');
// var dec = key2.publicDecrypt(enc, 'base64', 'utf8');
// console.log(enc);
// console.log(dec.toString());

// const cipher = crypto.createCipher('aes192', 'a password');

// let encrypted = '';
// cipher.on('readable', () => {
//   const data = cipher.read();
//   if (data)
//     encrypted += data.toString('hex');
// });
// cipher.on('end', () => {
//   console.log(encrypted);
//   // Prints: ca981be48e90867604588e75d04feabb63cc007a8f8ad89b10616ed84d815504
// });

// cipher.write('some clear text data');
// cipher.end();