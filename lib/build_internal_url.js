'use strict';

const Config = require('getconfig');
const InflateDomains = require('../lib/domains');

const Domains = InflateDomains(Config.talky.domains);


module.exports = function buildUrl() {

  const serverPort = Config.server ? Config.server.port : 80;

  if (Domains.api_private === Domains.api) {
    const isProd = Config.getconfig.env === 'production';
    const scheme = isProd ? 'https' : 'http';
    const port = isProd ? 80 : serverPort;
    const host = Domains.api + ((port !== 80) ? `:${port}` : '');
    return `${scheme}://${host}`;
  }

  return `http://${Domains.api_private}:${serverPort}`;
};
