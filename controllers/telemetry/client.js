'use strict';

const Joi = require('joi');
const UAParser = require('ua-parser-js');
const jwt = require('jsonwebtoken');

module.exports = {
  description: 'Ingest metrics from clients',
  tags: ['api', 'metrics'],
  handler: function (request, reply) {
    const { eventType, data } = request.payload
    const { session_id } = jwt.decode(request.headers.authorization);
    const { peerId, id } = data;
    this.db.events.insert({
      type: eventType,
      peer_id: peerId || null,
      room_id: id || null,
      actor_id: session_id
    })
    .then(() => reply(request.payload))
    .catch((err) => reply(err))
  },
  validate: {
    payload: {
      eventType: Joi.string(),
      data: Joi.object({
        peerId: Joi.string(),
        id: Joi.string()
      })
    }
  },
  auth: 'client-token'
};
