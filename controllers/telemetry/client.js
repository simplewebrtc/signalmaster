'use strict';

const Joi = require('joi');
const Schema = require('../../lib/schema');

module.exports = {
  description: 'Ingest metrics from clients',
  tags: ['api', 'metrics'],
  handler: function (request, reply) {

    const { eventType, peerId, roomId } = request.payload;
    const session = request.auth.credentials;
    this.db.events.insert({
      type: eventType,
      peer_id: peerId || null,
      room_id: roomId || null,
      actor_id: session.id
    })
      .then(() => reply(request.payload))
      .catch((err) => reply(err));
  },
  validate: {
    payload: {
      eventType: Schema.eventTypes,
      peerId: Joi.string(),
      roomId: Joi.string(),
      data: Joi.object()
    }
  },
  auth: 'client-token'
};
