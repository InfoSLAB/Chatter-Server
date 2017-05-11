const crypto = require('crypto');
var ursa = require('ursa');

module.exports = {
	aes: function(encrypted, key, fn) {
		const decipher = crypto.createDecipher('aes192', key);
		let decrypted = '';
		decipher.on('readable', () => {
			const data = decipher.read();
			if (data)
				decrypted += data.toString('utf8');
		});
		decipher.on('end', () => {
			fn(decrypted);
		})
		decipher.write(encrypted, 'hex');
		decipher.end();
	},
	rsa_pub: function(encrypted, pubPem) {
		var key = ursa.createPublicKey(pubPem);
		var decrypted = key.publicDecrypt(encrypted, 'base64', 'utf8');
		return decrypted;
	},
	rsa_priv: function(encrypted, priPem) {
		var key = ursa.createPrivateKey(priPem);
		var decrypted = key.decrypt(encrypted, 'base64', 'utf8');
		return decrypted;
	}
}

// const decipher = crypto.createDecipher('aes192', 'a password');

// let decrypted = '';
// decipher.on('readable', () => {
//   const data = decipher.read();
//   if (data)
//     decrypted += data.toString('utf8');
// });
// decipher.on('end', () => {
//   console.log(decrypted);
//   // Prints: some clear text data
// });

// const encrypted = 'ca981be48e90867604588e75d04feabb63cc007a8f8ad89b10616ed84d815504';
// decipher.write(encrypted, 'hex');
// decipher.end();