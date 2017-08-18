'use strict';

const Config = require('getconfig');
const Schema = require('../lib/schema');

const BuildUrl = require('../lib/build_url');
const InflateDomains = require('../lib/domains');
const Domains = InflateDomains(Config.talky.domains);

module.exports = {
  description: 'XMPP alternate connection type discovery',
  tags: ['api', 'websocket'],
  handler: function (request, reply) {

    const result = {
      links: [{
        rel: 'urn:xmpp:alt-connections:websocket',
        href: `${BuildUrl('ws', Domains.api)}/ws-bind`
      }]
    };

    return reply(result).type('application/json');
  },
  response: {
    status: {
      200: Schema.hostmeta
    }
  }
};
