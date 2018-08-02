'use strict';

const Config = require('getconfig');
const InflateDomains = require('../lib/domains');
const Domains = InflateDomains(Config.talky.domains);


module.exports = {
  description: 'API Server Setup Checklist',
  tags: ['web'],
  handler: function (request, h) {

    const IceConfig = Config.talky.ice || {};
    const ExtConfig = Config.talky.screensharingExtensions || {};


    const hasIceSecret = !!IceConfig.secret;
    const iceConfigured = IceConfig.secret && IceConfig.servers && IceConfig.servers.length > 0;

    const extsConfigured = !!ExtConfig.chrome;

    const hasInternalSecret = !!Config.auth.secret;
    const hasCustomerSecret = !!Config.talky.apiKey;


    return h.view('setup_checklist', {
      hasIceSecret,
      iceConfigured,
      extsConfigured,
      hasInternalSecret,
      hasCustomerSecret,
      config: Config,
      domains: Domains
    });
  }
};
