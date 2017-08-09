'use strict';

const Joi = require('joi');

module.exports = {
  description: 'Determine the room affiliation for a given room and user.',
  tags: ['api', 'prosody', 'auth'],
  handler: function (request, reply) {

    // By default, we want all room members to be owners so that they
    // can lock/unlock the room.

    return reply('owner').type('text/plain').code(200);
  },
  auth: 'prosody-api',
  validate: {
    payload: {
      id: Joi.string(),
      user_id: Joi.string()
    }
  }
};
