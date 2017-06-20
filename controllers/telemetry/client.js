'use strict';

const Joi = require('joi');
const UAParser = require('ua-parser-js');


module.exports = {
  description: 'Ingest metrics from clients',
  tags: ['api', 'metrics'],
  handler: function (request, reply) {
    const clientInfo = UAParser(request.headers['user-agent'] || 'unknown');
    console.log(clientInfo);
     
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

