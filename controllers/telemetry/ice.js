'use strict';

const Joi = require('joi');
const { promisify } = require('util');


module.exports = {
  description: 'Ingest traffic usage data from ICE servers',
  tags: ['api', 'ice', 'metrics'],
  handler: async function (request, h) {

    const params = request.payload;
    const now = new Date();

    const redis_rpush = promisify(this.redis.rpush.bind(this.redis));
    const event = {
      created_at: now,
      server: params.server,
      org_id: params.orgId,
      session_id: params.sessionId,
      bytes_sent: params.bytesSent,
      bytes_received: params.bytesReceived
    };

    await redis_rpush('ice_events', JSON.stringify(event));
    return h.response();
  },
  validate: {
    payload: {
      server: Joi.string().example('ice-us-1.talky.io'),
      orgId: Joi.string(),
      sessionId: Joi.string(),
      bytesSent: Joi.number(),
      bytesReceived: Joi.number()
    }
  },
  auth: 'internal-api'
};

