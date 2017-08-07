'use strict';

const Joi = require('joi');
const UUID = require('uuid');
const Schema = require('../../lib/schema');

const buildUrl = require('../../lib/buildUrl');
const fetchICE = require('../../lib/fetchIce');
const inflateDomains = require('../../lib/domains');

const TalkyCoreConfig = require('getconfig').talky;
const Domains = inflateDomains(TalkyCoreConfig.domains);


module.exports = {
  description: 'Auto-configure a bot client session',
  tags: ['api', 'config'],
  handler: async function (request, reply) {

    const randomId = UUID.v4();

    const ice = await fetchICE(request);

    const result =  {
      sessionId: randomId,
      userId: `${randomId}@${Domains.bots}`,
      signalingUrl: `${buildUrl('ws', Domains.api)}/ws-bind`,
      telemetryUrl: `${buildUrl('http', Domains.api)}/telemetry`,
      roomServer: Domains.rooms,
      iceServers: ice,
      credential: 'some-signed-jwt-token'//TODO
    };

    return reply(result);
  },
  response: {
    status: {
      200: Schema.bot
    }
  }
};

