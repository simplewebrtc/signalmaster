'use strict';

const Joi = require('joi');


module.exports = {
  description: 'Ingest metrics from Prosody',
  tags: ['api', 'metrics'],
  handler: function (request, reply) {
    const { eventType, data } = request.payload;
    const { roomId, jid, name, sessionId, userId } = data;
    console.log(request.payload);
    if (roomId) {
      this.db.rooms.findOne({ roomid: roomId })
      .then((room) => {
        if (!room) return this.db.rooms.insert({ name, roomid: roomId, jid })
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
