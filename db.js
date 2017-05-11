module.exports = {
    save: function(user) {
        var username = user.username;
        if (!user_list[username]) {
            user_list[username] = user;
            return true;
        } else {
            return false;
        }
    },
    getByName: function(username) {
        return user_list[username];
    }
}

user_list = {
    joker: {
        email: 'fd0joker@gmail.com',
        username: 'joker',
        pubkey: 'pubkey',
        friends: [
            'jiji',
        ],
    },
    jiji: {
        email: 'jiji@jiji.com',
        username: 'jiji',
        pubkey: 'jijikey',
        friends: [
            'joker',
        ],
    },
    nobody: {
        email: 'nobody@nobody.com',
        username: 'nobody',
        pubkey: 'nobodykey',
        friends: [],
    }
}