'use strict';

const Joi = require('@hapi/joi');

const RoomInfo = require('../../lib/room_info');
const UserInfo = require('../../lib/user_info');


module.exports = {
  description: 'Determine the room affiliation for a given room and user.',
  tags: ['api', 'prosody', 'auth'],
  handler: function (request, h) {

    const user = UserInfo(request.payload);
    const room = RoomInfo(request.payload);

    // Only allow users to join rooms with matching org IDs
    if (user.orgId !== room.orgId) {
      return h.response({ affiliation: 'outcast', role: 'none' }).code(200);
    }

    // By default, we want all room members to be owners so that they
    // can lock/unlock the room.
    return h.response({ affiliation: 'owner', role: 'moderator' }).code(200);
  },
  auth: 'internal-api',
  validate: {
    payload: {
      room_id: Joi.string(),
      user_id: Joi.string()
    }
  }
};
