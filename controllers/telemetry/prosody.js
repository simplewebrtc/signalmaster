'use strict';

const Config = require('getconfig');
const Crypto = require('crypto');
const Joi = require('joi');


module.exports = {
  description: 'Ingest metrics from Prosody',
  tags: ['api', 'metrics'],
  handler: function (request, reply) {
    const { eventType, data } = request.payload;
    let { roomId, name, sessionId, userId } = data;

    if (name && Config.talky.metrics && Config.talky.metrics.maskRoomNames) {
      name = Crypto.createHash('sha1').update(name).digest('base64');
    }

    console.log(request.payload);
    if (roomId) {
      this.db.rooms.findOne({ roomid: roomId })
      .then((room) => {
        if (!room) return this.db.rooms.insert({ name, roomid: roomId })
        else return room
      })
      .then((room) => {
        return this.db.events.insert({ type: eventType, room_id: room.roomid, actor_id: sessionId })
      })
      .then((insertedData) => reply(insertedData))
    } else {
      this.db.events.insert({ type: eventType, room_id: null, actor_id: sessionId })
      .then((insertedData) => reply(insertedData))
    }

  },
  validate: {
    payload: {
      eventType: Joi.string(),
      data: Joi.object()
    }
  },
  auth: 'prosody-api'
};
