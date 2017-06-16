'use strict';

const Joi = require('joi');
const UUID = require('uuid');

const fetchICE = require('../../lib/fetchIce');

const TalkyCoreConfig = require('getconfig').talky;

const API_DOMAIN = TalkyCoreConfig.apiDomain;
const GUEST_DOMAIN = TalkyCoreConfig.guestDomain || `guests.${API_DOMAIN}`;
const ROOM_DOMAIN = TalkyCoreConfig.roomDomain || `rooms.${API_DOMAIN}`;


module.exports = {
  description: 'Auto-configure a registered user client session',
  tags: ['api'],
  handler: function (request, reply) {

    const userId = UUID.v4();

    return fetchICE().then(ice => {

      return reply({
        sessionId: userId,
        userId: `${userId}@${GUEST_DOMAIN}`,
        signalingUrl: `wss://${API_DOMAIN}/xmpp-websocket`,
        telemetryUrl: `https://${API_DOMAIN}/telemetry`,
        roomServer: ROOM_DOMAIN,
        iceServers: ice,
        credential: 'some-signed-jwt-token'
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

