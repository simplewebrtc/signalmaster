'use strict';

const Config = require('getconfig');

const buildUrl = require('../lib/buildUrl');
const inflateDomains = require('../lib/domains');
const Domains = inflateDomains(Config.talky.domains);


module.exports = {
  description: 'XMPP alternate connection type discovery',
  tags: ['api', 'ice'],
  handler: function (request, reply) {

    return reply({
      links: [{
        rel: 'urn:xmpp:alt-connections:websocket',
        href: `${buildUrl('ws', Domains.api)}/ws-bind`
      }]
    }).type('application/json');
  }
};

