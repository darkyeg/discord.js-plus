'use strict';

const Action = require('./Action');
const Events = require('../../util/Events');

class RelationshipAdd extends Action {
  handle(data) {
    const { client } = this;
    const relationship = client.relationships.cache.get(data.id)?._clone();
    if (relationship) {
      client.emit(Events.relationshipUpdate, relationship, client.relationships._add(data));
    } else {
      client.emit(Events.relationshipAdd, client.relationships._add(data));
    }
  }
}

module.exports = RelationshipAdd;
