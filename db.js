module.exports = {
    save: function (user) {
        const username = user.username;
        if (!user_list[username]) {
            user_list[username] = user;
            return true;
        } else {
            return false;
        }
    },
    getByName: function (username) {
        return user_list[username];
    }
};

user_list = {
    joker: {
        email: 'fd0joker@gmail.com',
        username: 'joker',
        pubkey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjI4qXazuSMTgLgj8eE/o
eAQQ/r0RFPeckfiW+zoYKmA5gbRf1IPcVi6ltDTmAxKiz9fO9KQmIQbvzhCaqW3F
qOSABx9obB9Duh2DVY7rL3VZCL75CKNr6HHahuPvpW13iPrkZjEM9Hh/jl0KUDWV
fp8amJ/adpcTRo3vwovhdaMv64JLfg/Rpl6A8z+3HExW3UfSLS5R3aWbEGfnMXY8
jJ+QWAsyilE7LW0b3mZ9KLlQKtfUcDYZGdL5KykcH4rlpg9OsgulhZrjPj+nUq0M
eEl35LriV4afjo2/Hp/mo1LxG5+tScXItqpvx67pYE3bHnVOT/qZcN/KoFDQ7EWm
5QIDAQAB
-----END PUBLIC KEY-----`,
        friends: [
            'jiji',
        ],
    },
    jiji: {
        email: 'jiji@jiji.com',
        username: 'jiji',
        pubkey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyL1Hy+pGn/J6+n2rn2Hc
shBn+nz1Ub5rShKv2siU9IFdEY3ZlCjIqSD1zVFjXy+O6EqRyNjerb0VvLdRk1Oo
d+CL+qKA54bXhTm5RPWuGhQJ8MKO53gGxzguMjEBqp9GM1LQRjGGdsTaaxU/Itgt
+ylreRc25EUezpPMTfPA2P2H5VsbMDMxTPYsPZbP8I8tQH0W1JfNl04kiKTJAmPP
aVvJCnBGmiXPbY7mPY0jpuQLZ8I8bVnWQ2j38Oi7OEEA6vql3wRx+156yI1zyfZ4
zJ+mF3GO93dKTWfliroCU48pHy64W4yDBciAXbs3v2ud6U8GqRU5Su6Jjurnv0RX
QwIDAQAB
-----END PUBLIC KEY-----`,
        friends: [
            'joker',
        ],
    },
    nobody: {
        email: 'nobody@nobody.com',
        username: 'nobody',
        pubkey: ``,
        friends: [],
    }
};