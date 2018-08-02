'use strict';

const UUID = require('uuid');
const Schema = require('../../lib/schema');

const BuildUrl = require('../../lib/build_url');
const FetchICE = require('../../lib/fetch_ice');
const InflateDomains = require('../../lib/domains');

const TalkyCoreConfig = require('getconfig').talky;
const Domains = InflateDomains(TalkyCoreConfig.domains);

const DEFAULT_ORG = 'andyet';


module.exports = {
  description: 'Auto-configure a bot client session',
  tags: ['api', 'config'],
  handler: async function (request, h) {

    const randomId = UUID.v4();

    const ice = FetchICE(DEFAULT_ORG, randomId);

    const result =  {
      id: randomId,
      userId: `${randomId}@${Domains.bots}`,
      orgId: DEFAULT_ORG,
      signalingUrl: `${BuildUrl('ws', Domains.signaling)}/ws-bind`,
      telemetryUrl: `${BuildUrl('http', Domains.api)}/telemetry`,
      roomConfigUrl: `${BuildUrl('http', Domains.api)}/config/room`,
      roomServer: Domains.rooms,
      iceServers: ice,
      screensharingExtensions: {},
      credential: 'some-signed-jwt-token', //TODO
      apiVersion: TalkyCoreConfig.apiVersion
    };

    return result;
  },
  response: {
    status: {
      200: Schema.bot
    }
  }
};

