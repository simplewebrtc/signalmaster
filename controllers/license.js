'use strict';

const Config = require('getconfig');

const InflateDomains = require('../lib/domains');
const CheckLicense = require('../lib/licensing');

const Domains = InflateDomains(Config.talky.domains);

module.exports = {
  description: 'Talky License information',
  tags: ['web'],
  auth: 'admin',
  handler: async function (request, h) {

    let result;
    //Need to add hapi-var eslint rule
    let license;
    try {
      license = CheckLicense();

      result = h.view('license', {
        apiDomain: Domains.api,
        license
      });
    }
    catch (err) {

      result = h.view('license', {
        apiDomain: Domains.api,
        licenseError: err.message
      });
    }
    return result;
  }
};
