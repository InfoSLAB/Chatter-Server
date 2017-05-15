const crypto = require('crypto');
const NodeRsa = require('node-rsa');
const rstr = require('randomstring');

module.exports = {
    aes_gen_key: function () {
        return rstr.generate(10);
    },
    aes: function (plain, key) {
        const cipher = crypto.createCipher('aes192', key);
        let encrypted = cipher.update(plain, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    },
    rsa_gen_key_pair: function () {
        const key_pair = new NodeRsa({b: 512});
        const privKeyStr = key_pair.exportKey('pkcs8-private-pem');
        const pubKeyStr = key_pair.exportKey('pkcs8-public-pem');
        return {
            pubkey: pubKeyStr,
            privkey: privKeyStr,
        }
    },
    rsa_pub: function (plain, pubPem) {
        const key = new NodeRsa(pubPem);
        return key.encrypt(plain, 'base64', 'utf8');
    },
    rsa_priv: function (plain, priPem) {
        const key = new NodeRsa(priPem);
        return key.encryptPrivate(plain, 'base64', 'utf8');
    },
    hashcode: function (data) {
        return crypto.createHash('md5').update(data).digest('hex');
    }
};