'use strict';

const Config = require('getconfig');
const InflateDomains = require('../lib/domains');
const Domains = InflateDomains(Config.talky.domains);


module.exports = {
  description: 'API Homepage',
  tags: ['web'],
  handler: async function (request, h) {

    return h.view('home', {
      domains: Domains,
      iceServer: Config.talky.ice.server,
      screensharingExtensions: Config.talky.screensharingExtensions || {}
    });
  }
};
