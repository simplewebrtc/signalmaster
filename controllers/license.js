'use strict';

const Config = require('getconfig');

const InflateDomains = require('../lib/domains');
const CheckLicense = require('../lib/licensing');

const Domains = InflateDomains(Config.talky.domains);

module.exports = {
  description: 'Talky License information',
  tags: ['web'],
  auth: 'admin',
  handler: function (request, reply) {

    return CheckLicense().then((license) => {

      reply.view('license', {
        apiDomain: Domains.api,
        license
      });
    }).catch((err) => {

      reply.view('license', {
        apiDomain: Domains.api,
        licenseError: err.message
      });
    });
  }
};
