'use strict';

const Joi = require('joi');

module.exports = {
  description: 'Determine the room affiliation for a given room and user.',
  tags: ['api', 'prosody', 'auth'],
  handler: function (request, reply) {

    return reply('owner').type('text/plain').code(200);
  },
  auth: 'prosody-api',
  validate: {
    payload: {
      roomId: Joi.string(),
      userId: Joi.string()
    }
  }
};
