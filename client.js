const io = require('socket.io-client');
const $ = require("jquery");
const decipher = require('./decipher');
const cipher = require('./cipher');
const cli_util = require('./client_util');
const NodeRsa = require('node-rsa');

const commands = ['login', 'login-ack', 'register', 'friend', 'chat', 'file'];

let tempKey;

function onErr(err) {
    console.log(err);
}

function onQuit(result) {
    socket.disconnect();
    console.log(result);
}

function loadUser(username) {
    const privkey = prompt("your key");
    const pubkey = new NodeRsa(privkey).exportKey('public');
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

    const username = prompt("user name", "joker");
    const user = loadUser(username ? username : 'joker');
    console.log('load user:', user);

    function append(element) {
        $('#messages').append($('<li>').append(element));
    }

    function createDownload(fileName, blob) {
        return $('<a>').text(fileName).attr('href', URL.createObjectURL(blob)).attr('download', fileName);
    }

    $("#msgBtn").click(function () {
        const tokens = $('#m').val().split(' ');
        const cmd = tokens.shift();
        socket.emit(cmd, cli_util.message[cmd](tokens, user));
        $('#m').val = '';
    });

    // socket.on('chat', function (msg) {
    //     append($('<span>').text(msg));
    //     window.scrollTo(0, document.body.scrollHeight);
    // });

    socket.on('login', function (data) {
        cli_util.handler['login'](data, user);
    });

    socket.on('login-ack', function (data) {
        cli_util.handler['login-ack'](data, user);
    });

    socket.on('register', function (data) {
        cli_util.handler['register'](data, user);
    });

    socket.on('friend', function (data) {
        cli_util.handler['friend'](data, user);
    });

    socket.on('chat', function (data) {
        cli_util.handler['chat'](data, user);
    });

    $('#post').change(function () {
        const recipient = $('#userList').val();
        let files = $('#post')[0].files;
        if (files.length !== 0) {
            let reader = new FileReader();
            reader.onload = function (evt) {
                let file = evt.target.result;
                // TODO
            };
            reader.readAsDataURL(files[0]);
        }
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