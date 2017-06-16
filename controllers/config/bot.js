'use strict';

const Joi = require('joi');
const UUID = require('uuid');


const TalkyCoreConfig = require('getconfig').talky;

const API_DOMAIN = TalkyCoreConfig.apiDomain;
const BOT_DOMAIN = TalkyCoreConfig.botDomain || `bots.${API_DOMAIN}`;
const ROOM_DOMAIN = TalkyCoreConfig.roomDomain || `rooms.${API_DOMAIN}`;


module.exports = {
  description: 'Auto-configure a bot client session',
  tags: ['api'],
  handler: function (request, reply) {

    const userId = UUID.v4();

    return reply({
      sessionId: userId,
      userId: `${userId}@${BOT_DOMAIN}`,
      signalingUrl: `wss://${API_DOMAIN}/xmpp-websocket`,
      telemetryUrl: `https://${API_DOMAIN}/telemetry`,
      roomServer: ROOM_DOMAIN,
      iceServers: [],
      credential: 'some-signed-jwt-token'
    });
  },
  validate: {
    payload: {
    }
  }
};

