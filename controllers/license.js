'use strict';

const Config = require('getconfig');

const inflateDomains = require('../lib/domains');
const checkLicense = require('../lib/licensing');

const Domains = inflateDomains(Config.talky.domains);


module.exports = {
  description: 'API Homepage',
  tags: [],
  handler: function async (request, reply) {
    checkLicense().then(license => {
      reply.view('license', {
        apiDomain: Domains.api,
        license
      });
    }).catch(err => {
      reply.view('license', {
        apiDomain: Domains.api,
        licenseError: err.message
      });
    });
  }
};
