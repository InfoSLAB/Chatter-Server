var cipher = require('./cipher');
var decipher = require('./decipher');

module.exports = {
	rsa_key_pair: rsa_key_pair,
	aes_key: aes_key,
	handler: {
		login: function(data) {
			console.log(data);
			// var username = data.username;
			// var key = data.key;
			// var challenge = data.challenge;
			// aes_key = decipher.rsa_priv(key, rsa_key_pair.privkey);
			// console.log(aes_key);
			// var challenge = decipher.aes(challenge, aes_key, function(challenge_plain) {
			// 	console.log(challenge_plain);
			// });
		}
	},
	message: {
		login: function(tokens) {
			return {
				username: tokens[0],
			}
		}
	}
}

var rsa_key_pair = {
		pubkey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjI4qXazuSMTgLgj8eE/o
eAQQ/r0RFPeckfiW+zoYKmA5gbRf1IPcVi6ltDTmAxKiz9fO9KQmIQbvzhCaqW3F
qOSABx9obB9Duh2DVY7rL3VZCL75CKNr6HHahuPvpW13iPrkZjEM9Hh/jl0KUDWV
fp8amJ/adpcTRo3vwovhdaMv64JLfg/Rpl6A8z+3HExW3UfSLS5R3aWbEGfnMXY8
jJ+QWAsyilE7LW0b3mZ9KLlQKtfUcDYZGdL5KykcH4rlpg9OsgulhZrjPj+nUq0M
eEl35LriV4afjo2/Hp/mo1LxG5+tScXItqpvx67pYE3bHnVOT/qZcN/KoFDQ7EWm
5QIDAQAB
-----END PUBLIC KEY-----`,
		privkey: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCMjipdrO5IxOAu
CPx4T+h4BBD+vREU95yR+Jb7OhgqYDmBtF/Ug9xWLqW0NOYDEqLP1870pCYhBu/O
EJqpbcWo5IAHH2hsH0O6HYNVjusvdVkIvvkIo2vocdqG4++lbXeI+uRmMQz0eH+O
XQpQNZV+nxqYn9p2lxNGje/Ci+F1oy/rgkt+D9GmXoDzP7ccTFbdR9ItLlHdpZsQ
Z+cxdjyMn5BYCzKKUTstbRveZn0ouVAq19RwNhkZ0vkrKRwfiuWmD06yC6WFmuM+
P6dSrQx4SXfkuuJXhp+Ojb8en+ajUvEbn61Jxci2qm/HrulgTdsedU5P+plw38qg
UNDsRablAgMBAAECggEAI1GF68wMhFSUUH0Jk+HgdGfxLVGs/SvLOBLTPYW3lM5h
JOqCOhB4SV+nW8T/Fz6Tks6Tvn2Q5zOrBoi9lF11EZ95XFDUGHcyuY249sLW7jH6
kWwLf9QwxVP2qXaVPWhoZQ9GXTduHfA5fTh74vPUAOFR+ZARgUMtIMmBuc0Udk6N
Ae0/XvSbU+dV3f65AiSIVGwT9ZKfH6lPuURx48JTWIlSRqESgrf3DQ66uPZQ+Ji3
C64j7L5Mx4ThLH1sEyfEo+K46/JoAvAH7uLcSF+k23y2MqbMbuIcw5WOd6EQSbyw
o31/opHwyqzhd94G/+2fRR0uUb1hh8bvNiaeOieBgQKBgQDyZsdo7Ome3Yd/lBJb
nFog+IGyqwWLUMkEQY324Ym4gL/ZYmfdkGkcfsjx9f3gU4biQBaiaY+PDN2Nniyp
w43YRlg8CnFxHkyJkYsRILTiWvPEr+mYhUyZJrQxnAy+6DdhGknQ4tdS4qwRZ05A
LBBi03+c5B6CdreIqucmzoeMyQKBgQCUcLwbxUHlTH+NEn+jff6bu0rvqlmzjKsa
OA8tzmWooGoWGPeR2tb+FVZBC0axnkPIkjCxRBz4hLGhwF6fPsQJBs5Q6zQqfu8r
HiSGmYCSKEEXg7XBnkQKq3eF97tDa5ANm8KhJG9vGltTy0ZgPDCMdYv+ax5DC69k
o43JMdzDPQKBgQCG3ZZPE5k70Ydk/Q5luA0RURJgRPT1uUHOQ2boGD4W0FNtcGnX
hVRmDUhiDvpsiCyAzyWIwXClJ4RRGdNBtNLDpQfMiAbr5+6vj7GvGuJpGi+MnE88
k9W1VCpne6o/wVWmigjN1pf0vrb7i92mqJ2JTqEuumEbN1AQEv4+wiP6uQKBgQCE
9iIYwe0PhiEubOZ1vLLmLbKm0LD+mj7dAl/eSOVYUTAVURHYzOwMtXIIWyBckwXm
T8Rb1EYa+UjfOR/IhoE0EKuXYcbdVcvHlH1lL3Qx9uqvNGQG5UvPPt2V21wavOtQ
tTd1/dvu6e3qNcd5BhD6j4PxRWPa7EmT3Mhw8j/rhQKBgGRQMeFUrtS5HHAOxX/y
xhESLA/j1p/SQymBvnMBZtNEJDlfxpQsmSRS5ftnLq9se/eVy6aFpY5qR3OPRwCn
lMbVsqdGcvpr4DQ3VsngqiBy1pzNQtKXToT8gkF0OaFsJBEErF+YJdhtBV7uB48U
p/r5/DL9qNZlbj7qnWq05PcD
-----END PRIVATE KEY-----`,
	};
var aes_key = '';
