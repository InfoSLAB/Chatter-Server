const cipher = require('./cipher');
const decipher = require('./decipher');

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
            if (cha_res_plain !== user.my_challenge + 1) {
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
            console.log(JSON.parse(decipher.aes(data, aes_key)));
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
        }
    }
};