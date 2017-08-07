'use strict';

const Config = require('getconfig');
const Crypto = require('crypto');
const Joi = require('joi');

module.exports = {
  description: 'Ingest metrics from Prosody',
  tags: ['api', 'metrics'],
  handler: async function (request, reply) {
    const { eventType, data } = request.payload;
    let { roomId, name, sessionId, userId, jid } = data;

    if (name && Config.talky.metrics && Config.talky.metrics.maskRoomNames) {
      name = Crypto.createHash('sha1').update(name).digest('base64');
    }

    if (roomId) {
      let room = await this.db.rooms.findOne({ roomid: roomId });
      if (!room) {
        room = await this.db.rooms.insert({ name, roomid: roomId, jid });
      }

      if(eventType === 'room_destroyed') {
        //Record room ended column
        await this.db.rooms.updateOne(room, { ended_at: new Date()});
        await this.db.events.insert({ type: eventType, room_id: room.roomid, actor_id: sessionId });
      } else {
        //Record event
        await this.db.events.insert({ type: eventType, room_id: room.roomid, actor_id: sessionId });
      }

      return reply();
    } else {
      if (eventType === 'user_offline') {
        //Record user ended column
        const user = await this.db.users.findOne({ sessionid: sessionId });
        await this.db.users.updateOne(user, {
          ended_at: new Date()
        });
        const insertedData = await this.db.events.insert({
          type: eventType,
          room_id: null,
          actor_id: sessionId
        });
        return reply();
      } else if (eventType === 'user_online') {
        // Clear out existing user ended column if session reconnected
        const user = await this.db.users.findOne({
          sessionid: sessionId
        });

        if (user) {
          await this.db.users.updateOne(user, {
            created_at: new Date(),
            ended_at: null
          });
        }

        const insertedData = await this.db.events.insert({
          type: eventType,
          room_id: null,
          actor_id: sessionId
        });
        return reply();
      } else {
        const insertedData = await this.db.events.insert({
          type: eventType,
          room_id: null,
          actor_id: sessionId
        });
        return reply();
      }
    }
  },
  validate: {
    payload: {
      eventType: Joi.string(),
      data: Joi.object({
        roomId: Joi.string(),
        name: Joi.string(),
        sessionId: Joi.string(),
        userId: Joi.string(),
        jid: Joi.string()
      }).unknown()
    }
  },
  auth: 'prosody-api'
};
