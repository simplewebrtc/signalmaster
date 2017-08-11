'use strict';

const Config = require('getconfig');
const InflateDomains = require('../lib/domains');
const Domains = InflateDomains(Config.talky.domains);


module.exports = {
  description: 'API Homepage',
  tags: ['web'],
  handler: function (request, reply) {

    reply.view('home', {
      domains: Domains,
      iceServers: Config.talky.ice.servers,
      screensharingExtensions: Config.talky.screensharingExtensions || {}
    });
  }
};
