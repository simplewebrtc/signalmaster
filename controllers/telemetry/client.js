'use strict';

const Joi = require('joi');
const { promisify } = require('util');
const Schema = require('../../lib/schema');

module.exports = {
  description: 'Ingest metrics from clients',
  tags: ['api', 'metrics'],
  handler: async function (request, h) {

    const { eventType, peerId, roomId, data, batch } = request.payload;
    if (batch.length === 0) {
      batch.push({
        eventType,
        peerId,
        roomId,
        data
      });
    }

    const session = request.auth.credentials;
    const now = new Date();
    const rpush = promisify(this.redis.rpush.bind(this.redis));

    const updates = [];
    for (const item of batch) {
      const event = {
        created_at: now,
        updated_at: now,
        type: item.eventType,
        peer_id: item.peerId,
        room_id: item.roomId,
        actor_id: session.id,
        data: item.data
      };

      updates.push(rpush('events', JSON.stringify(event)));
    }

    await Promise.all(updates);

    return h.response();
  },
  validate: {
    payload: {
      eventType: Schema.eventTypes.optional(),
      peerId: Joi.string().optional(),
      roomId: Joi.string().optional(),
      data: Joi.object().unknown().default({}).optional(),
      batch: Joi.array().items(
        Joi.object({
          eventType: Schema.eventTypes,
          peerId: Joi.string(),
          roomId: Joi.string(),
          data: Joi.object().unknown().default({})
        })
      ).optional().default([])
    }
  },
  auth: 'client-token'
};
