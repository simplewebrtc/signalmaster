'use strict';

const Joi = require('joi');
const UAParser = require('ua-parser-js');
const jwt = require('jsonwebtoken');

module.exports = {
  description: 'Ingest metrics from clients',
  tags: ['api', 'metrics'],
  handler: function (request, reply) {
    const { eventType, data } = request.payload
    const dataObject = JSON.parse(data);
    const { sessionId } = jwt.decode(request.headers.authorization);
    const { peerId, roomId } = dataObject
    this.db.events.insert({
      type: eventType,
      peer_id: peerId || null,
      room_id: roomId || null,
      actor_id: sessionId
    })
    .then(() => reply(request.payload))
    .catch((err) => console.log(err))
  },
  validate: {
    payload: {
      eventType: Joi.string(),
      data: Joi.string()
    }
  },
  auth: 'client-token'
};

