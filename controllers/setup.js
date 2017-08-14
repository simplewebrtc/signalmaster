'use strict';

const Config = require('getconfig');
const InflateDomains = require('../lib/domains');
const Domains = InflateDomains(Config.talky.domains);


module.exports = {
  description: 'API Server Setup Checklist',
  tags: ['web'],
  handler: function (request, reply) {

    const IceConfig = Config.talky.ice || {};
    const ExtConfig = Config.talky.screensharingExtensions || {};


    const hasIceSecret = !!IceConfig.secret;
    const iceConfigured = IceConfig.secret && IceConfig.servers && IceConfig.servers.length > 0;

    const extsConfigured = !!ExtConfig.chrome;

    const hasLicense = !!Config.talky.license;
    const hasInternalSecret = !!Config.auth.secret;
    const hasCustomerSecret = !!Config.talky.apiKey;


    reply.view('setup_checklist', {
      hasIceSecret,
      iceConfigured,
      extsConfigured,
      hasInternalSecret,
      hasCustomerSecret,
      hasLicense,
      config: Config,
      domains: Domains
    });
  }
};
