'use strict';

const Action = require('./Action');
const Events = require('../../util/Events');

class RelationshipRemove extends Action {
  handle(data) {
    const { client } = this;
    const { relationships } = client;
    let relationship = relationships._add(data);
    relationships.cache.delete(data.id);
    client.emit(Events.RelationshipRemove, relationship);
  }
}

module.exports = RelationshipRemove;
