'use strict';

const Discord = require('../src');
const { token } = require('./auth.js');
const client = new Discord.Client();

client.on('ready', () => {

	const relationshipsSize = client.relationships.cache.size;
	const blockedSize = client.user.blockList.size;
	const friendsSize = client.user.friends.size;
	console.log(`You have ${relationshipsSize} relationships.`)
	console.log(`${blockedSize} blocked.`)
	console.log(`${friendsSize} friends.`)
	
})
client.on('debug', console.log);
client.on('error', m => console.log('debug', new Error(m).stack));
client.on('reconnecting', m => console.log('reconnecting', m));
client.on('relationshipRemove', console.log)
client.on('relationshipAdd', console.log)
client.on('relationshipUpdate', console.log)

client
  .login(token)
  .then(() => console.log('logged in'))
  .catch(console.error);