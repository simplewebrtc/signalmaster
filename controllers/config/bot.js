'use strict';

const UUID = require('uuid');
const Schema = require('../../lib/schema');

const BuildUrl = require('../../lib/build_url');
const FetchICE = require('../../lib/fetch_ice');
const InflateDomains = require('../../lib/domains');

const TalkyCoreConfig = require('getconfig').talky;
const Domains = InflateDomains(TalkyCoreConfig.domains);

module.exports = {
  description: 'Auto-configure a bot client session',
  tags: ['api', 'config'],
  handler: async function (request, reply) {

    const randomId = UUID.v4();

    const ice = await FetchICE(request);

    const result =  {
      id: randomId,
      userId: `${randomId}@${Domains.bots}`,
      signalingUrl: `${BuildUrl('ws', Domains.api)}/ws-bind`,
      telemetryUrl: `${BuildUrl('http', Domains.api)}/telemetry`,
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

