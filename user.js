module.exports = {
	createUser: createUser
}

function createUser(id, username, password, email, pubkey) {
	var obj = {};
	obj.id = id;
	obj.username = username;
	obj.password = password;
	obj.email = email;
	obj.pubkey = pubkey;
	return obj;
}