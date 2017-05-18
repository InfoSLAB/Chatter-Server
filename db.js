module.exports = {
    save: function (user) {
        // var sync = true;
        // const username = user.username;
        // console.log(`save user with name: ${username}`);
        // // Use connect method to connect to the server
        // MongoClient.connect(url, function(err, db) {
        //   assert.equal(null, err);
        //   console.log("Connected successfully to server");

        //   var collection = db.collection('users');
        //   collection.find({username: username}).toArray(function (err, users) {
        //     if (users.length === 0) {
        //         console.log(`no user named ${username}`);
        //         collection.insert(user);
        //     }
        //     sync = false;
        //     db.close();
        //   });
        // });
        // while(sync) require('deasync').sleep(100);
        // console.log(`user: ${user.username} added to db`);
        const username = user.username;
        if (!user_list[username]) {
            user_list[username] = user;
            return true;
        } else {
            return false;
        }
    },
    getByName: function (username) {
        // var the_user;
        // var sync = true;
        // MongoClient.connect(url, function(err, db) {
        //   assert.equal(null, err);
        //   console.log("Connected successfully to server");

        //   var collection = db.collection('users');
        //   collection.find({username: username}).toArray(function (err, users) {
        //     if (users.length === 0) {
        //         console.log(`no user named ${username}`);
        //     } else {
        //         the_user = users[0];
        //         sync = false;
        //     }
        //     db.close();
        //   });
        // });
        // while (sync) require('deasync').sleep(100);
        // console.log(`get user: ${the_user} from db`);
        // return the_user;
        return user_list[username];
    },
    getAll:function () {
        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);

            var collection = db.collection('users');
            collection.find({}).toArray(function(err, users) {
                console.log(users);
                db.close();
            });
        });
    },
    init: init,
    writeback: writeback,
};

user_list = {
//     joker: {
//         email: 'fd0joker@gmail.com',
//         username: 'joker',
//         pubkey: `-----BEGIN PUBLIC KEY-----
// MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjI4qXazuSMTgLgj8eE/o
// eAQQ/r0RFPeckfiW+zoYKmA5gbRf1IPcVi6ltDTmAxKiz9fO9KQmIQbvzhCaqW3F
// qOSABx9obB9Duh2DVY7rL3VZCL75CKNr6HHahuPvpW13iPrkZjEM9Hh/jl0KUDWV
// fp8amJ/adpcTRo3vwovhdaMv64JLfg/Rpl6A8z+3HExW3UfSLS5R3aWbEGfnMXY8
// jJ+QWAsyilE7LW0b3mZ9KLlQKtfUcDYZGdL5KykcH4rlpg9OsgulhZrjPj+nUq0M
// eEl35LriV4afjo2/Hp/mo1LxG5+tScXItqpvx67pYE3bHnVOT/qZcN/KoFDQ7EWm
// 5QIDAQAB
// -----END PUBLIC KEY-----`,
//         friends: [
//             'jiji',
//         ],
//     },
//     jiji: {
//         email: 'jiji@jiji.com',
//         username: 'jiji',
//         pubkey: `-----BEGIN PUBLIC KEY-----
// MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyL1Hy+pGn/J6+n2rn2Hc
// shBn+nz1Ub5rShKv2siU9IFdEY3ZlCjIqSD1zVFjXy+O6EqRyNjerb0VvLdRk1Oo
// d+CL+qKA54bXhTm5RPWuGhQJ8MKO53gGxzguMjEBqp9GM1LQRjGGdsTaaxU/Itgt
// +ylreRc25EUezpPMTfPA2P2H5VsbMDMxTPYsPZbP8I8tQH0W1JfNl04kiKTJAmPP
// aVvJCnBGmiXPbY7mPY0jpuQLZ8I8bVnWQ2j38Oi7OEEA6vql3wRx+156yI1zyfZ4
// zJ+mF3GO93dKTWfliroCU48pHy64W4yDBciAXbs3v2ud6U8GqRU5Su6Jjurnv0RX
// QwIDAQAB
// -----END PUBLIC KEY-----`,
//         friends: [
//             'joker',
//         ],
//     },
//     nobody: {
//         email: 'nobody@nobody.com',
//         username: 'nobody',
//         pubkey: ``,
//         friends: [],
//     }
};

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://10.131.251.231:27017/islab-chatter-server';

// module.exports.save(user_list.joker);
// console.log(module.exports.getByName('joker'));

function init() {
    console.log('db init');
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected successfully to db server");

      var collection = db.collection('users');
      collection.find().toArray(function (err, users) {
        for (var index in users) {
            var user = users[index];
            user_list[user.username] = user;
        }
        db.close();
      });
    });
}

function writeback() {
    // comment this if there is no db available
    console.log('db writeback');
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected successfully to db server");

      var collection = db.collection('users');
      // console.log(user_list);
      for (var username in user_list) {
        var user = user_list[username];
        collection.update({username: username}, {$set: user}, {upsert: true});
      }
    });
}

// comment this if there is no db available
init();
// setTimeout(writeback, 1000);