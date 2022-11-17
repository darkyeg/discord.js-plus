'use strict';

const { Collection } = require('@discordjs/collection');
const { Routes } = require('discord-api-types/v10');
const CachedManager = require('./CachedManager');
const PresenceManager = require('./PresenceManager');
const { GuildMember } = require('../structures/GuildMember');
const { Message } = require('../structures/Message');
const Relationship = require('../structures/Relationship');
const ThreadMember = require('../structures/ThreadMember');
const User = require('../structures/User');

/**
 * Manages API methods for relationships and stores their cache.
 * @extends {CachedManager}
 */
class RelationshipManager extends CachedManager {
  constructor(client, iterable) {
    super(client, Relationship, iterable);

    /**
     * Presences of relationships
     * @type {PresenceManager}
     */
    this.presences = new PresenceManager(client);
  }

  /**
   * The cache of this manager
   * @type {Collection<Snowflake, Relationship>}
   * @name RelationshipManager#cache
   */

  /**
   * Data that resolves to give a Relationship object. This can be:
   * * A Relationship object
   * * A User object
   * * A Snowflake
   * * A Message object (resolves to the message author)
   * * A GuildMember object
   * @typedef {Relationship|UserResolvable} RelationshipResolvable
   */

  /**
   * Resolves a RelationshipResolvable to a Relationship object.
   * @param {RelationshipResolvable} relationship The RelationshipResolvable to identify
   * @returns {?Relationship}
   */
  resolve(relationship) {
    if (relationship instanceof User) return relationship.relationship;
    if (relationship instanceof GuildMember) return relationship.user.relationship;
    if (relationship instanceof ThreadMember) return relationship.user.relationship;
    if (relationship instanceof Message) return relationship.author.relationship;
    return super.resolve(relationship);
  }

  /**
   * Resolves a RelationshipResolvable to a relationship ID string.
   * @param {RelationshipResolvable} relationship The RelationshipResolvable to identify
   * @returns {?Snowflake}
   */
  resolveID(relationship) {
    if (relationship instanceof User) return relationship.id;
    if (relationship instanceof GuildMember) return relationship.id;
    if (relationship instanceof ThreadMember) return relationship.id;
    if (relationship instanceof Message) return relationship.id;
    return super.resolveID(relationship);
  }
  /**
   * Obtains a relationships from Discord, or the relationships cache if it's already available.
   * @param {boolean} [cache=true] Whether to cache the new relationship object if it isn't already
   * @returns {Promise<Collection<Snowflake, Relationship>>}
   */
  async fetchAll(cache = true) {
    const data = await this.client.rest.get(`${Routes.user()}/relationships`);
    const relationships = new Collection();
    for (const relationship of data) relationships.set(relationship.id, this._add(relationship, cache));
    return relationships;
  }
}

module.exports = RelationshipManager;
