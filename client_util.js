const cipher = require('./cipher');
const decipher = require('./decipher');
const crypto = require('crypto');

// TODO get public key
const getPubKey = function (sender) {
    if (sender === 'joker') {
        return `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjI4qXazuSMTgLgj8eE/o
eAQQ/r0RFPeckfiW+zoYKmA5gbRf1IPcVi6ltDTmAxKiz9fO9KQmIQbvzhCaqW3F
qOSABx9obB9Duh2DVY7rL3VZCL75CKNr6HHahuPvpW13iPrkZjEM9Hh/jl0KUDWV
fp8amJ/adpcTRo3vwovhdaMv64JLfg/Rpl6A8z+3HExW3UfSLS5R3aWbEGfnMXY8
jJ+QWAsyilE7LW0b3mZ9KLlQKtfUcDYZGdL5KykcH4rlpg9OsgulhZrjPj+nUq0M
eEl35LriV4afjo2/Hp/mo1LxG5+tScXItqpvx67pYE3bHnVOT/qZcN/KoFDQ7EWm
5QIDAQAB
-----END PUBLIC KEY-----`;
    }
    else if (sender === 'jiji') {
        return `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyL1Hy+pGn/J6+n2rn2Hc
shBn+nz1Ub5rShKv2siU9IFdEY3ZlCjIqSD1zVFjXy+O6EqRyNjerb0VvLdRk1Oo
d+CL+qKA54bXhTm5RPWuGhQJ8MKO53gGxzguMjEBqp9GM1LQRjGGdsTaaxU/Itgt
+ylreRc25EUezpPMTfPA2P2H5VsbMDMxTPYsPZbP8I8tQH0W1JfNl04kiKTJAmPP
aVvJCnBGmiXPbY7mPY0jpuQLZ8I8bVnWQ2j38Oi7OEEA6vql3wRx+156yI1zyfZ4
zJ+mF3GO93dKTWfliroCU48pHy64W4yDBciAXbs3v2ud6U8GqRU5Su6Jjurnv0RX
QwIDAQAB
-----END PUBLIC KEY-----`;
    }
};

module.exports = {
    handler: {
        login: function (data, user) {
            console.log(data);
            const username = data.username;
            const key = data.key;
            const challenge = data.challenge;
            const cha_res = data.cha_res;
            let aes_key = 'empty';
            try {
                aes_key = decipher.rsa_priv(key, user.privkey);
            } catch (ex) {
                console.log('error decrypting session key. Please offer the correct user key.');
                return;
            }
            console.log('session key:', aes_key);
            user.session_key = aes_key;
            const cha_res_plain = decipher.aes(cha_res, aes_key);
            if (parseInt(cha_res_plain) !== user.my_challenge + 1) {
                console.log('response:', cha_res_plain);
                console.log('challenge:', user.my_challenge);
                console.log('server challenge fail.');
                return;
            }
            const challenge_plain = decipher.aes(challenge, aes_key);
            user.server_challenge = challenge_plain;
            console.log('server_challenge:', challenge_plain);
        },
        'login-ack': function (data, user) {
            console.log(data);
        },
        register: function (data, user) {
            console.log(data);
        },
        friend: function (data, user) {
            const aes_key = user.session_key;
            console.log(JSON.parse(decipher.aes(data, aes_key)));
        },
        chat: function (data, user) {
            const aes_key = user.session_key;
            return (JSON.parse(decipher.aes(data, aes_key)));
        },
        file: function (data, user) {
            const sender = data.sender;
            const filename = data.filename;
            const filedata = data.data;
            const signature = data.signature;
            if (cipher.hashcode(filedata) === decipher.rsa_pub(signature, getPubKey(sender)))
                return {
                    sender: sender,
                    filename: filename,
                    data: filedata
                };
            console.log("signature doesn't match");
        }
    },
    message: {
        login: function (tokens, user) {
            const challenge = parseInt(Math.random() * 10000);
            console.log('my challenge:', challenge);
            const enc_challenge = cipher.rsa_pub(challenge.toString(), user.server_pubkey);
            user.my_challenge = challenge;
            return {
                username: tokens[0],
                challenge: enc_challenge,
            }
        },
        'login-ack': function (tokens, user) {
            const session_key = user.session_key;
            const enc_challenge = cipher.aes(tokens[1].toString(), session_key.toString());
            return {
                username: tokens[0],
                challenge: enc_challenge,
            }
        },
        register: function (tokens, user) {
            return {
                email: tokens[0],
                username: tokens[1],
                pubkey: tokens[2],
            }
        },
        friend: function (tokens, user) {
            const aes_key = user.session_key;
            return cipher.aes(JSON.stringify({
                sender: tokens[0],
                receiver: tokens[1],
                type: tokens[2],  // (q)uery, (a)ccept, (d)eny, (l)ist
            }), aes_key);
        },
        chat: function (tokens, user) {
            const aes_key = user.session_key;
            return cipher.aes(JSON.stringify({
                sender: tokens.shift(),
                receiver: tokens.shift(),
                content: tokens.join(' '),
            }), aes_key);
        },
        file: function (tokens, user) {
            const sender = tokens.shift();
            const receiver = tokens.shift();
            const filename = tokens.shift();
            const data = tokens.shift();
            const signature = cipher.rsa_priv(cipher.hashcode(data), user.privkey);
            return {
                sender: sender,
                receiver: receiver,
                filename: filename,
                data: data,
                signature: signature
            };
        }
    }
};