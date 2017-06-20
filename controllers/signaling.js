'use strict';

const Config = require('getconfig');
const inflateDomains = require('../lib/domains');
const Domains = inflateDomains(Config.talky.domains);


const port = Config.isDev ? (Config.isDevTLS ? 5281 : 5280) : 5281;


module.exports = {
  description: 'Proxy to Prosody for signaling.',
  tags: ['api'],  
  handler: function (request, reply) {
    reply('x');
  }
};

