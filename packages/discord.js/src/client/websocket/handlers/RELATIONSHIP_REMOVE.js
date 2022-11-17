'use strict';

module.exports = (client, packet) => {
  client.actions.RelationshipRemove.handle(packet.d);
};
