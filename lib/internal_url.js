'use strict';

const Config = require('getconfig');
const Domains = require('../lib/domains');

const serverPort = Config.server ? Config.server.port : 80;

let url;
if (Domains.api_private === Domains.api) {
  const isProd = Config.getconfig.env === 'production';
  const scheme = isProd ? 'https' : 'http';
  const port = isProd ? 80 : serverPort;
  const host = Domains.api + ((port !== 80) ? `:${port}` : '');
  url = `${scheme}://${host}`;
}
else {
  url = `http://${Domains.api_private}:${serverPort}`;
}

module.exports = url;
