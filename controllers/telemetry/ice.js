'use strict';

const Joi = require('joi');


module.exports = {
  description: 'Ingest traffic usage data from ICE servers',
  tags: ['api', 'ice', 'metrics'],
  handler: function (request, reply) {

    // Placeholder route to start accepting data until we have the
    // processing & billing side sorted out.

    // TODO: save ICE usage metric events

    request.log(['ice'], request.payload);
    return reply();
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

