'use strict';

const ClientApplication = require('../../../structures/ClientApplication');
let ClientUser;

module.exports = (client, { d: data }, shard) => {
  if (client.user) {
    client.user._patch(data.user);
  } else {
    ClientUser ??= require('../../../structures/ClientUser');
    client.user = new ClientUser(client, data.user);
    client.users.cache.set(client.user.id, client.user);
  }

  for (const guild of data.guilds) {
    guild.shardId = shard.id;
    client.guilds._add(guild);
  }

  if (data.application) {
    if (client.application) {
      client.application._patch(data.application);
    } else {
      client.application = new ClientApplication(client, data.application);
    }
  }

  if (data.private_channels) {
    for (const channel of data.private_channels) {
      client.channels._add(channel);
    }
  }

  if (data.relationships) {
    for (const relationship of data.relationships) {
      client.relationships._add(relationship);
    }
  }

  if (data.presences) {
    for (const presence of data.presences) {
      client.relationships.presences._add(presence);
    }
  }

  shard.checkReady();
};
