const email = require("emailjs");
const server = email.server.connect({
    user: "lnfosec@outlook.com",
    password: "infosec2017",
    host: "smtp-mail.outlook.com",
    tls: {ciphers: "SSLv3"}
});

function message(to, nickname, code) {
    return {
        text: "Your Verification code is " + code,
        from: "InfosecLab <lnfosec@outlook.com>",
        to: nickname + " <" + to + ">",
        subject: "Verification code from InfosecLab"
    }
}

module.exports.sendEmail = function (to, nickname, code) {
    server.send(message(to, nickname, code), function (err, message) {
        console.log(err || message);
    });
};