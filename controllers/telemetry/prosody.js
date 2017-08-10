'use strict';

const Config = require('getconfig');
const Crypto = require('crypto');
const Joi = require('joi');

module.exports = {
  description: 'Ingest metrics from Prosody',
  tags: ['api', 'metrics'],
  handler: async function (request, reply) {

    const { eventType, data } = request.payload;
    const { session_id, room_id } = data;
    let { name } = data;
    const { jid } = data;

    if (name && Config.talky.metrics && Config.talky.metrics.maskRoomNames) {
      name = Crypto.createHash('sha1').update(name).digest('base64');
    }

    const session = await this.db.sessions.findOne({ id: session_id });

    if (!session) {
      //TODO edge case to handle
    }

    if (room_id) {
      let room = await this.db.rooms.findOne({ id: room_id });
      if (!room) {
        const roomAttrs = { name, id: room_id, jid };
        room = await this.db.rooms.insert(roomAttrs);
      }

      if (eventType === 'room_destroyed') {
        //Record room ended column
        await this.db.rooms.updateOne(room, { ended_at: new Date() });
        await this.db.events.insert({ type: eventType, room_id: room.id, actor_id: session_id });
      }
      else {
        const event = { type: eventType, room_id: room.id, actor_id: session_id };
        //Record event
        await this.db.events.insert(event);
      }

      return reply();
    }
    if (eventType === 'user_offline') {
      //Record user ended column
      await this.db.sessions.updateOne(session, {
        ended_at: new Date()
      });
      await this.db.events.insert({
        type: eventType,
        room_id: null,
        actor_id: session_id
      });
      return reply();
    }
    else if (eventType === 'user_online') {
      // Clear out existing user ended column if session reconnected
      await this.db.sessions.updateOne(session, {
        created_at: new Date(),
        ended_at: null
      });

      await this.db.events.insert({
        type: eventType,
        room_id: null,
        actor_id: session_id
      });
      return reply();
    }
    await this.db.events.insert({
      type: eventType,
      room_id: null,
      actor_id: session_id
    });
    return reply();


  },
  validate: {
    payload: {
      eventType: Joi.string(),
      data: Joi.object({
        room_id: Joi.string(),
        session_id: Joi.string(),
        user_id: Joi.string(),
        jid: Joi.string(),
        name: Joi.string()
      }).unknown()
    }
  },
  auth: 'prosody-api'
};
