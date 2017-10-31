'use strict';

const Joi = require('joi');
const UserInfo = require('../../lib/user_info');


module.exports = {
  description: 'Provide user information for a new room occupant.',
  tags: ['api', 'prosody'],
  handler: function (request, reply) {

    const info = UserInfo(request.payload.user_id, request.payload.session_id);
    return reply(info).type('application/json').code(200);
  },
  auth: 'internal-api',
  validate: {
    payload: Joi.object({
      room_id: Joi.string().required(),
      user_id: Joi.string().required(),
      session_id: Joi.string().required()
    })
  }
};
