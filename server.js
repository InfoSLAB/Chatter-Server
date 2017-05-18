const express = require('express');
const app = express();
var http = require('http').Server(app);
var db = require('./db');
var io = require('socket.io')(http);
var port = 3000;

var decipher = require('./decipher');
var cipher = require('./cipher');
var aes_key = 'a password';

var user = require('./user').createUser;
var user_list = [];

const email_util = require('./email_util');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));

io.on('connection', function (socket) {
    var is_online = false;
    var username = '';
    var aes_key = '';
    console.log('client connected');
    var challenge = parseInt(Math.random() * 10000);
    var last_timestamp = 0;


    const newUsers = new Map();

    function check_integrity(obj) {
        if (!obj.hash) {
            console.log('no hash!');
            return 0;
        }
        var orig_hash = obj.hash;
        delete obj.hash;
        var new_hash = cipher.hashcode(JSON.stringify(obj));
        if (new_hash === orig_hash)
            return 1;
        else
            return 0;
    }

    function check_timestamp(cur_ts) {
        if (cur_ts == undefined)
            return 1;
        var flag = last_timestamp < cur_ts ? 1 : 0;
        last_timestamp = cur_ts;
        return flag;
    }

    socket.on('login', function (data) {
        if (authentication({is_online: is_online}, socket)) {
            socket.emit('login', {content: 'you are already login'});
            return;
        }
        username = data.username;
        var client_challenge = decipher.rsa_priv(data.challenge, server_privkey);
        console.log('client_challenge:', client_challenge);
        var cli_cha_resp = parseInt(client_challenge, 10) + 1;
        var user = db.getByName(username);
        if (!user) {
            socket.emit('login', {content: username + ' does not exist'});
            return;
        }
        var pubkey = user.pubkey;
        // TODO generate aes_key
        aes_key = cipher.aes_gen_key();
        console.log('aes_key:', aes_key);
        // TODO encrypt aes_key with user`s pubkey
        var encrypted_aes_key = cipher.rsa_pub(aes_key, pubkey);
        challenge = parseInt(Math.random() * 10000);
        // TODO encrypt challenge with aes_key
        var enc_challenge = cipher.aes(challenge.toString(), aes_key);
        var enc_cli_cha_res = cipher.aes(cli_cha_resp.toString(), aes_key);
        socket.emit('login', {
            username: username,
            key: encrypted_aes_key,
            challenge: enc_challenge,
            cha_res: enc_cli_cha_res
        });
        console.log('encrypted_aes_key: ' + encrypted_aes_key);
    });
    socket.on('login-ack', function (data) {
        if (authentication({is_online: is_online}, socket)) {
            socket.emit('login', {content: 'you are already login'});
            return;
        }
        if (!data.username || !data.challenge) {
            console.log('broken packet');
            challenge = parseInt(Math.random() * 10000);
            return;
        }
        username = data.username;
        // TODO decrypt challenge with aes_key
        console.log('enc_challenge:', data.challenge, 'key:', aes_key);
        var challenge_res = decipher.aes(data.challenge.toString(), aes_key);
        console.log('challenge generated by server:', challenge, 'response:', challenge_res);
        if (parseInt(challenge_res, 10) === parseInt(challenge, 10) + 1) {
            console.log(username + ' login success');
            socket.emit('login-ack', {content: username + ' login success'});
            is_online = true;
            online_users.set(username, {socket: socket, session_key: aes_key});
            updateFriendList(username);
        } else {
            socket.emit('login-ack', {content: 'login fail'});
            challenge = parseInt(Math.random() * 10000);
        }
    });
    socket.on('register', function (data) {
        if (authentication({is_online: is_online}, socket)) {
            socket.emit('register', {content: 'please log out first'});
            return;
        }
        console.log('receive register', data);
        const new_user = {};
        new_user.email = data.email;
        new_user.username = data.username;
        new_user.pubkey = data.pubkey;
        new_user.friends = [];
        const vcode = parseInt(Math.random() * 10000);
        new_user.vcode = vcode;

        newUsers.set(data.email, new_user);

        console.log(new_user.email, new_user.vcode);

        email_util.sendEmail(new_user.email, new_user.username, new_user.vcode);

        socket.emit('register', {response: 'please check your email box for verification code'});
    });
    socket.on('register-ack', function (data) {
        if (authentication({is_online: is_online}, socket)) {
            socket.emit('register', {content: 'please log out first'});
            return;
        }
        console.log('receive register-ack', data);

        if (newUsers.has(data.email)) {
            const newUser = newUsers.get(data.email);
            if (parseInt(data.vcode) === newUser.vcode) {
                delete newUser.vcode;
                const r = db.save(newUser);
                socket.emit('register-ack', {response: r});
            } else
                socket.emit('register-ack', {response: 'invalid vcode'});
        }
        else {
            socket.emit('register-ack', {response: 'invalid email'});
        }
    });
    socket.on('friend', function (encrypted) {
        if (!authentication({is_online: is_online}, socket)) {
            console.log('friend authentication failed');
            return;
        }
        var data = decipher.aes(encrypted, aes_key);

        // what's this for?
        if (data.sender != username) {
            console.log('sender:', data.sender, 'username:', username);
            data.sender = username;
        }
        var data = JSON.parse(decipher.aes(encrypted, aes_key));
        if (!check_integrity(data) || !check_timestamp(data.timestamp)) {
            console.log('packet is broken or out-dated');
            return;
        }
        console.log('receive friend ', data);
        var sendername = data.sender;
        var receivername = data.receiver;
        var sender = db.getByName(sendername);
        var receiver = db.getByName(receivername);
        var type = data.type;  // (q)uery, (a)ccept, (d)eny, (l)ist
        if (type === 'q') {
            forwarding_msg(sendername, receivername, {
                event: 'friend',
                data: {sender: sendername, receiver: receivername, type: 'q'},
            });
        }

        const friends = sender.friends;
        switch (type) {
            case 'q':
                sender.friends.push(receivername);
                break;
            case 'd':
                // remove sender`s name from receiver`s friend list
                const index = receiver.friends.indexOf(sendername);
                if (index > -1)
                    receiver.friends.splice(index, 1);

                forwarding_msg(sendername, receivername, {
                    event: 'friend',
                    data: {sender: sendername, receiver: receivername, type: 'd'},
                });

                updateFriendList(username);

                break;
            case 'a':
                sender.friends.push(receivername);

                forwarding_msg(sendername, receivername, {
                    event: 'friend',
                    data: {sender: sendername, receiver: receivername, type: 'a'},
                });

                updateFriendList(username);

                break;
            case 'l':
                socket.emit('friend',
                    cipher.aes(JSON.stringify({
                        sender: sendername,
                        receiver: receivername,
                        type: 'l',
                        content: sender.friends
                    }), aes_key));
                break;
            default:
                console.log('query type not supported');
                return;
        }
    });
    socket.on('chat', function (encrypted) {
        if (!authentication({is_online: is_online}, socket)) {
            console.log('chat authentication failed');
            return;
        }
        var data = JSON.parse(decipher.aes(encrypted, aes_key));
        if (!check_integrity(data) || !check_timestamp(data.timestamp)) {
            console.log('packet is broken or out-dated');
            return;
        }
        if (data.sender != username) {
            console.log('sender:', data.sender, 'username:', username);
            data.sender = username;
        }
        console.log('receive chat ', data);
        var sendername = data.sender;
        var receivername = data.receiver;
        var msg = data.content;
        if (online_users.has(sendername) && online_users.has(receivername)) {
            forwarding_msg(sendername, receivername, {event: 'chat', data: {sender: sendername, content: msg}});
        } else {
            socket.emit('chat',
                cipher.aes(JSON.stringify({
                    content: 'sorry, ' + receivername + ' is offline.'
                }), aes_key));
        }
        // TODO forward message to receiver
    });
    socket.on('file', function (encrypted) {
        if (!authentication({is_online: is_online}, socket))
            return;
        var data = JSON.parse(decipher.aes(encrypted, aes_key));
        if (!check_timestamp(data.timestamp)) {
            console.log('packet is broken or out-dated');
            return;
        }
        console.log('receive file ' + data);
        const sendername = data.sender;
        const receivername = data.receiver;
        const filename = data.filename;
        const filedata = data.data;
        const signature = data.signature;
        forwarding_file(sendername, receivername, {
            event: 'file',
            data: {sender: sendername, filename: filename, data: filedata, signature: signature}
        });
    });
    socket.on('disconnect', function () {
        for (let [username, object] of online_users) {
            console.log(object.socket.id, socket.id);
            if (object.socket.id === socket.id) {
                console.log(username + " left");
                online_users.delete(username);
            }
        }
        updateFriendList(username);
        console.log('client disconnected');
    });
});

http.listen(port, function () {
    console.log('listening on *:' + port);
});

const online_users = new Map();
function forwarding_msg(snd_nm, recv_nm, packet) {
    console.log(`forward msg:`, packet, ` from ${snd_nm} to ${recv_nm}`);
    console.log('packet data in json string:', JSON.stringify(packet.data));
    var sender = online_users.get(snd_nm);
    var receiver = online_users.get(recv_nm);

    if (!receiver) {
        console.log('receiver offline');
        return;
    }

    var sndr_sock = sender.socket;
    var recr_sock = receiver.socket;
    var event = packet.event;
    var data = cipher.aes(
        JSON.stringify(packet.data),
        receiver.session_key);
    recr_sock.emit(event, data);
}

function forwarding_file(snd_nm, recv_nm, packet) {
    console.log('forward file:', packet, ` from ${snd_nm} to ${recv_nm}`);
    console.log('packet data in json string:', JSON.stringify(packet.data));
    const sender = online_users.get(snd_nm);
    const receiver = online_users.get(recv_nm);
    const recr_sock = receiver.socket;
    const event = packet.event;
    const data = cipher.aes(
        JSON.stringify(packet.data),
        receiver.session_key);
    recr_sock.emit(event, data);
}

function authentication(prereq, socket) {
    const is_online = prereq.is_online;
    if (!is_online) {
        console.log('client request not online');
        socket.emit('au-error', {reason: 'client not logged in!'});
        return false;
    }
    return true;
}

function getFriendsAndKey(username, online) {
    var user = db.getByName(username);
    if (user == undefined || user == null)
        return;
    let friends = user.friends;
    if (!friends) {
        console.log('invalid username');
        return;
    }
    if (online)
        friends = friends.filter(un => online_users.has(un));
    return friends.map(function (f) {
        return {
            username: f, pubkey: db.getByName(f).pubkey
        }
    });
}

function updateFriendList(username) {
    const onlineFriendsAndKeys = getFriendsAndKey(username, true);
    if (!onlineFriendsAndKeys) {
        console.log('unable to get friends and keys');
        return;
    }
    if (online_users.has(username))
        online_users.get(username).socket.emit('friend-list', onlineFriendsAndKeys);
    onlineFriendsAndKeys
        .forEach(f => online_users.get(f.username).socket.emit('friend-list', getFriendsAndKey(f.username, true)));
}

const server_privkey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCD/+KXlWj41Cbu
DYMTwkKcBewlTE1UcH0uxnWLcW4x1eUpQwLbyd4ol85IBQ5p/Wv/iJrNxpzWIE4A
Qgauqzki6oN9YOhKcVHxowayH6vO6s8KhO7SwzRW5GlO8PCcSfSWD4xeO92QpRH6
S5nTVxKm+9VHO/jdG2/6XrQziAdjT+b/kaqHIiLm4iBEycir4gI8rFq6SxHQ6G6F
EOSYYOU26Gv+x2sR9RP+p7s3VUIduCejR1AudmHlDx1lIhkZheq3TYcsRUUFstTV
8uVlBIQozRv1FL8GCJQRmpDDtP78nxIZ321t+zZEQP17CIEB1aPLG+dLb9l8gMDh
Qbb/vRz5AgMBAAECggEAK4DGzgx41yEcX3Jmk7l/OGqfRD+ccMrOBv9zN+y/U39a
Ejo6k/M424oEeynncTkLQeFkm5Lsl4l4C4+3IhPeNcqyYTzx8a7dQdTn3QahGgW7
DI15JE8fTc/jgRfZRLj++gHP0jLKt+QfQ61s2gElbZEr3lk+kKh9RDe4Dg+z15+7
Ph0trE12xVolHr8TPtiNQqfBdo/Np+dSuMZu6oEkgOBku8ttPI3jBSbt3T5NMiXl
ggrBPMZ+1slPDQ1PaJyLfiabTMoDD/UlvaRsiHfUr++K1rbHp99XQaisz2KuGhjA
UkrULXTtaR3OaKvG0aldS39FGxT4yl87tg3ThexgcQKBgQD+JSzkSVvTxGQCU9g0
03ZMOfX9Cx3NcsJWPlz6HkY+ndSO49QDG0VVGPdXWbsoe6wTgYzQD33+AaMgqCfd
FrDQ5+hXiX+ll3TK8Pa1rs7/muQk5DHcHw32hoJu8KxV8khiqqtRATgCp+lQXG4d
P2MxKvSz2/xZMrmajThSXDVBpQKBgQCE9oCnXC+wHP5/Hsxcb7UKX5+GZL2XVoox
Ws15Ljx3MClPLrHr1WpUy0hQYNRrq4QivBE+sH9JdESsvfgDNx0phKcgo0ouiXDs
sVGLl8SM+/HqlRSjab8dZSraddgtn71ntAFFQMPg9qGqIIhnXo2H8BdDnx7gYiVs
N+2jypXlxQKBgD+c5oOtqQJ0oePDQNbYJ0AlMeFIqwkFtIcJzRP+B+8calvpwuOU
K+KFAUQn/aTAb+3h+3EIr6yolEBUVsYMK+3eXlWq4Px90IoLjnUjcESibICfbat/
Smtud691Jm3M2zl3JrJ7750akle/CwDfIODps55hbeSVwcdhmbtjwSDRAoGAR9Ym
jEVyPmRr26J4JzjzRzeCqMmk5S8MWr4EZYRlhr+ukelYl2ImoMlzuHmYStPQADQ7
3PLe0oDO2cWJSbNtPhE9epS+b4YyTK9Ar3q/5qv4eBUzoVZwuyD9lio1MfEsE+td
BF2JdvHJRnFtQOwE63z8FLzTocdlEKLm8adydUECgYEAjagImI25z6ydjBdsCCE/
lTlg4YMvP3URSMNMNq3faeT0t9Nvd/qrfJx+2OYihb89V+sF+9YM/ycGJN0iFIw8
ahl8ZaUpFHWNi1rMuYRzBsjhh16eVRhnaiE37MRt9EL7H0Gf4ETsdoI/fJW5dBS1
Wtse7sTZ+I/jif9IkR8o3bk=
-----END PRIVATE KEY-----`;