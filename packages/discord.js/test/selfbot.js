'use strict';

const { token } = require('./auth');
const { Client, GatewayIntentBits } = require('../');

const client = new Client({
  bot: false,
  intents: Object.keys(GatewayIntentBits),
});

client.on('ready', () => {
  console.log(client.user.tag);
});

client.login(token);
