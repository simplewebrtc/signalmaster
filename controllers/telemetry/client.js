'use strict';

const Joi = require('joi');


module.exports = {
  description: 'Ingest metrics from clients',
  tags: ['api', 'metrics'],
  handler: function (request, reply) {

    return reply(request.payload);
  },
  validate: {
    payload: {
      eventType: Joi.string(),
      data: Joi.string()
    }
  },
  auth: 'client-token'
};

