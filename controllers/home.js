'use strict';

const Config = require('getconfig');
const Domains = require('../lib/domains');


module.exports = {
  description: 'API Homepage',
  tags: ['web'],
  handler: async function (request, h) {

    return h.view('home', {
      domains: Domains,
      iceServer: Config.talky.ice.server
    });
  }
};
