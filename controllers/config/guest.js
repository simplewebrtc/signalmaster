'use strict';

const Config = require('getconfig');
const Joi = require('joi');
const JWT = require('jsonwebtoken');
const UUID = require('uuid');

const fetchICE = require('../../lib/fetchIce');
const inflateDomains = require('../../lib/domains');

const TalkyCoreConfig = require('getconfig').talky;
const Domains = inflateDomains(TalkyCoreConfig.domains);


module.exports = {
  description: 'Auto-configure a registered user client session',
  tags: ['api'],
  handler: function (request, reply) {

    const userId = UUID.v4();

    return fetchICE().then(ice => {

      return reply({
        sessionId: userId,
        userId: `${userId}@${Domains.guests}`,
        signalingUrl: `wss://${Domains.api}/xmpp-websocket`,
        telemetryUrl: `https://${Domains.api}/telemetry`,
        roomServer: Domains.rooms,
        iceServers: ice,
        credential: JWT.sign({
            iss: Domains.api,
            aud: Domains.api,
            sub: userId,
        }, Config.auth.secret, {
          algorithm: 'HS256',
          expiresIn: '1 day'
        })
      });
    });
  },
  validate: {
    payload: {
      clientType: Joi.string(), // browser | mobile
      os: Joi.string().optional(),
      browser: Joi.string().optional(),
      userAgent: Joi.string().optional()
    }
  }
};

