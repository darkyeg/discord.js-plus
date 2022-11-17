'use strict';

const Base = require('./Base');

/**
 * Represents a relationship on Discord.
 * @extends {Base}
 */
class Relationship extends Base {
  /**
   * @param {Client} client The instantiating client
   * @param {Object} data The data for the relationship
   */
  constructor(client, data) {
    super(client);
    /**
     * The user
     * @type {User}
     */
    this.user = client.users._add(data.user);

    /**
     * The ID of the user
     * @type {Snowflake}
     */
    this.id = data.id;

    /**
     * Type of relationship
     * @type {Number}
     */
    this.type = data.type;
  }
  _patch(data) {
    if ('user' in data) this.user = this.client.users._add(data.user);

    if ('type' in data) this.type = data.type;
  }
}

module.exports = Relationship;
