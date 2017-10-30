'use strict';

const Config = require('getconfig');
const Joi = require('joi');
const Base32 = require('base32-crockford-browser');

const JID = require('../../lib/jid');
const InflateDomains = require('../../lib/domains');

const Domains = InflateDomains(Config.talky.domains);


module.exports = {
  description: 'Provide user information for a new room occupant.',
  tags: ['api', 'prosody'],
  handler: function (request, reply) {

    const domain = JID.domain(request.payload.user_id);
    const userInfo = {
      id: request.payload.session_id
    };

    switch (domain) {
      case Domains.users: {
        userInfo.userType = 'registered';
        userInfo.customerData = JSON.parse(Base32.decode(JID.local(request.payload.user_id)));
        break;
      }

      case Domains.bots: {
        userInfo.userType = 'bot';
        break;
      }

      default: {
        userInfo.userType = 'guest';
        userInfo.customerData = { id: 'anon' };
      }
    }

    return reply(userInfo).type('application/json').code(200);
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
