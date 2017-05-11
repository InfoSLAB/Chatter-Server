const crypto = require('crypto');
const rsa = require('node-rsa');

module.exports = {
	aes: function(plain, key, fn) {
		const cipher = crypto.createCipher('aes192', key);
		let encrypted = '';
		cipher.on('readable', () => {
			const data = cipher.read();
			if (data)
				encrypted += data.toString('hex');
		});
		cipher.on('end', () => {
			fn(encrypted);
		});
		cipher.write(plain);
		cipher.end();
	},
	rsa: function(plain, key, fn) {

	}
}

var ursa = require('ursa');
var fs = require('fs');

// create a pair of keys (a private key contains both keys...)
var keys = ursa.generatePrivateKey();
console.log('keys:', keys);

// reconstitute the private key from a base64 encoding
var privPem = keys.toPrivatePem('base64');
console.log('privPem:', privPem);

var priv = ursa.createPrivateKey(privPem, '', 'base64');

// make a public key, to be used for encryption
var pubPem = keys.toPublicPem('base64');
console.log('pubPem:', pubPem);

var pub = ursa.createPublicKey(pubPem, 'base64');

// encrypt, with the private key, then decrypt with the public
var data = new Buffer('hello world');
console.log('data:', data);

var enc = pub.encrypt(data);
console.log('enc:', enc);

var unenc = priv.decrypt(enc);
console.log('unenc:', unenc);

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