'use strict';

const Config = require('getconfig');
const Crypto = require('crypto');
const Joi = require('joi');

module.exports = {
  description: 'Ingest metrics from Prosody',
  tags: ['api', 'metrics'],
  handler: async function (request, reply) {

    const { eventType, data } = request.payload;
    const { id, user_id, jid } = data;
    let { name } = data;

    if (name && Config.talky.metrics && Config.talky.metrics.maskRoomNames) {
      name = Crypto.createHash('sha1').update(name).digest('base64');
    }

    const user = await this.db.users.findOne({ id: user_id });

    if (!user) {
      //TODO edge case to handle
    }

    if (id) {
      let room = await this.db.rooms.findOne({ id });
      if (!room) {
        room = await this.db.rooms.insert({ name, id, jid });
      }

      if (eventType === 'room_destroyed') {
        //Record room ended column
        await this.db.rooms.updateOne(room, { ended_at: new Date() });
        await this.db.events.insert({ type: eventType, room_id: room.id, actor_id: user_id });
      }
      else {
        //Record event
        await this.db.events.insert({ type: eventType, room_id: room.id, actor_id: user_id });
      }

      return reply();
    }
    if (eventType === 'user_offline') {
      //Record user ended column
      await this.db.users.updateOne(user, {
        ended_at: new Date()
      });
      await this.db.events.insert({
        type: eventType,
        room_id: null,
        actor_id: user_id
      });
      return reply();
    }
    else if (eventType === 'user_online') {
      // Clear out existing user ended column if session reconnected
      await this.db.users.updateOne(user, {
        created_at: new Date(),
        ended_at: null
      });

      await this.db.events.insert({
        type: eventType,
        room_id: null,
        actor_id: user_id
      });
      return reply();
    }
    await this.db.events.insert({
      type: eventType,
      room_id: null,
      actor_id: user_id
    });
    return reply();


  },
  validate: {
    payload: {
      eventType: Joi.string(),
      data: Joi.object({
        id: Joi.string(),
        user_id: Joi.string(),
        name: Joi.string(),
        jid: Joi.string()
      }).unknown()
    }
  },
  auth: 'prosody-api'
};
