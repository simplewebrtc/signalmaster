'use strict';

const Config = require('getconfig');
const Joi = require('joi');
const Base32 = require('base32-crockford-browser');

const JID = require('../../lib/jid')
const inflateDomains = require('../../lib/domains');

const Domains = inflateDomains(Config.talky.domains);


module.exports = {
  description: 'Provide user information for a new room occupant.',
  tags: ['api', 'prosody'],
  handler: function (request, reply) {

    const domain = JID.domain(request.payload.userId);
    let userInfo = {
      sessionId: request.payload.sessionId
    };

    switch (domain) {
      case Domains.users: {
        userInfo.userType = 'registered';
        userInfo.customerData = JSON.parse(Base32.decode(JID.local(request.payload.userId)));
        break;
      }

      case Domains.bots: {
        userInfo.userType = 'bot';
      }

      default: {
        userInfo.userType = 'guest';
      }
    }

    return reply(userInfo).type('application/json').code(200);
  },
  auth: 'prosody-api',
  validate: {
    payload: {
      roomId: Joi.string(),
      userId: Joi.string(),
      sessionId: Joi.string()
    }
  }
};
