'use strict';

const Config = require('getconfig');

const inflateDomains = require('../lib/domains');

const Domains = inflateDomains(Config.talky.domains);


module.exports = {
  description: 'API Homepage',
  tags: [],
  handler: function (request, reply) {
    reply.view('home', { domains: Domains, iceServers: Config.talky.ice.servers });
  }
};
