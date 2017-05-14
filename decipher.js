const crypto = require('crypto');
const NodeRsa = require('node-rsa');

module.exports = {
    aes: function (encrypted, key) {
        const decipher = crypto.createDecipher('aes192', key);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    },
    rsa_pub: function (encrypted, pubPem) {
        const key = new NodeRsa(pubPem);
        return key.decryptPublic(encrypted, 'utf8');
    },
    rsa_priv: function (encrypted, priPem) {
        const key = new NodeRsa(priPem);
        return key.decrypt(encrypted, 'utf8');
    }
};