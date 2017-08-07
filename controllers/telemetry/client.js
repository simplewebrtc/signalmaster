'use strict';

const Joi = require('joi');
const UAParser = require('ua-parser-js');
const jwt = require('jsonwebtoken');

module.exports = {
  description: 'Ingest metrics from clients',
  tags: ['api', 'metrics'],
  handler: function (request, reply) {
    const { eventType, data } = request.payload
    const { sessionId } = jwt.decode(request.headers.authorization);
    const { peerId, roomId } = data;
    this.db.events.insert({
      type: eventType,
      peer_id: peerId || null,
      room_id: roomId || null,
      actor_id: sessionId
    })
    .then(() => reply(request.payload))
    .catch((err) => reply(err))
  },
  validate: {
    payload: {
      eventType: Joi.string(),
      data: Joi.object({
        peerId: Joi.string(),
        roomId: Joi.string()
      })
    }
  },
  auth: 'client-token'
};

