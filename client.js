const io = require('socket.io-client');
const $ = require("jquery");
const decipher = require('./decipher');
const cipher = require('./cipher');
const cli_util = require('./client_util');
const NodeRsa = require('node-rsa');

function loadUser(username) {
    const privkey = prompt("your key");
    const pubkey = new NodeRsa(privkey).exportKey('pkcs8-public-pem');
    // const server_pubkey = prompt("server key");
    return {
        username: username,
        pubkey: pubkey,
        privkey: privkey,
        server_pubkey: server_pubkey,
    }
}

$(function () {

    const socket = io('http://localhost:3000');
    socket.on('connect', function () {
        console.log('socket connected');
    });

    let user = null;

    if (confirm("Are you a new user?")) {
        const username = prompt("user name", "joker");
        const email = prompt("email", "foo@bar.com");
        const key = cipher.rsa_gen_key_pair();
        append($('<span>').text('Please keep your private key safe for latter login: ')
            .append(createDownload('priv_key.pem', new Blob([key.privkey]))));
        user = {
            username: username,
            pubkey: key.pubkey,
            privkey: key.privkey,
            server_pubkey: server_pubkey,
        };
        // can't use process because there're blanks in pubkey
        socket.emit('register', cli_util.message['register']([email, username, key.pubkey], user));
    } else {
        const username = prompt("user name", "joker");
        user = loadUser(username ? username : 'joker');
        console.log('load user:', user);
        process('login ' + user.username);
    }

    function process(proc_string) {
        const tokens = proc_string.split(' ');
        const cmd = tokens.shift();
        socket.emit(cmd, cli_util.message[cmd](tokens, user));
    }

    function append(element) {
        $('#messages').append($('<li>').append(element));
    }

    function createDownload(fileName, blob) {
        return $('<a>').text(fileName).attr('href', URL.createObjectURL(blob)).attr('download', fileName);
    }

    $("#msgBtn").click(function () {
        const friendList = $('#friendList');
        const m = $('#m');
        if (friendList.val() && m.val()) {
            process('chat ' + user.username + ' ' + friendList.val() + ' ' + m.val());
            append($('<span>').text(user.username + ": " + m.val()));
            m.val('');
        }
    });

    $("#friendBtn").click(function () {
        const publicIdentity = prompt('the user\'s public identity:');
        process('friend ' + user.username + ' ' + publicIdentity + ' q');
        append($('<span>').text('friend request to ' + publicIdentity + ' sent.'));
    });

    $('#post').change(function () {
        const recipient = $('#friendList').val();
        let files = $('#post')[0].files;
        if (files.length !== 0) {
            let reader = new FileReader();
            reader.onload = function (evt) {
                let file = evt.target.result;
                process('file ' + user.username + ' ' + $('#friendList').val() + ' ' + files[0].name + ' ' + file);
            };
            reader.readAsDataURL(files[0]);
        }
    });

    socket.on('chat', function (data) {
        const decryptedData = cli_util.handler['chat'](data, user);
        append($('<span>').text(decryptedData.sender + ": " + decryptedData.content));
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on('file', function (data) {
        const decryptedData = cli_util.handler['file'](data, user);
        fetch(decryptedData.data).then(res => res.blob()).then(blob => {
            append(createDownload(decryptedData.filename, blob));
        });
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on('login', function (data) {
        cli_util.handler['login'](data, user);
        process('login-ack ' + user.username + ' ' + (parseInt(user.server_challenge) + 1));
    });

    socket.on('login-ack', function (data) {
        cli_util.handler['login-ack'](data, user);
        append($('<span>').text(user.username + " login success."));
    });

    socket.on('register', function (data) {
        cli_util.handler['register'](data, user);
        process('login ' + user.username);
    });

    socket.on('friend', function (data) {
        const response = cli_util.handler['friend'](data, user);
        switch (response.type) {
            case 'q':
                const span = $('<span>').text(response.sender + " want to make a friend with you:")
                    .append($("<button>").text('accept').click(function () {
                        process('friend ' + user.username + ' ' + response.sender + ' a');
                        span.empty().append('friend request from ' + response.sender + ' accepted');
                    })).append($("<button>").text('deny').click(function () {
                        process('friend ' + user.username + ' ' + response.sender + ' d');
                        span.empty().append('friend request from ' + response.sender + ' denied');
                    }));
                append(span);
                break;
            case 'd':
                append($('<span>').text(response.sender + " didn't want to you be a friend."));
                break;
            case 'a':
                append($('<span>').text(response.sender + " accepted you as a friend."));
                break;
            default:
                console.log('query type not supported');
                return;
        }
    });

    socket.on("friend-list", function (data) {
        const friendList = $('#friendList');
        const selected = friendList.val();
        friendList.empty();
        if (!user.friendsKey)
            user.friendsKey = new Map();
        for (let d of data) {
            console.log(d);
            friendList.append("<option value='" + d.username + "'>" + d.username + "</option>");
            user.friendsKey.set(d.username, d.pubkey);
        }
        if (selected)
            friendList.val(selected);
    });
});

const server_pubkey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAg//il5Vo+NQm7g2DE8JC
nAXsJUxNVHB9LsZ1i3FuMdXlKUMC28neKJfOSAUOaf1r/4iazcac1iBOAEIGrqs5
IuqDfWDoSnFR8aMGsh+rzurPCoTu0sM0VuRpTvDwnEn0lg+MXjvdkKUR+kuZ01cS
pvvVRzv43Rtv+l60M4gHY0/m/5GqhyIi5uIgRMnIq+ICPKxauksR0OhuhRDkmGDl
Nuhr/sdrEfUT/qe7N1VCHbgno0dQLnZh5Q8dZSIZGYXqt02HLEVFBbLU1fLlZQSE
KM0b9RS/BgiUEZqQw7T+/J8SGd9tbfs2RED9ewiBAdWjyxvnS2/ZfIDA4UG2/70c
+QIDAQAB
-----END PUBLIC KEY-----`;