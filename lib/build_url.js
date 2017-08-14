'use strict';

const Config = require('getconfig');

module.exports = function buildUrl(proto, domain, overridePort) {

  const isProd = Config.getconfig.env === 'production';
  const defaultPort = Config.server ? Config.server.port : 80;

  const scheme = (isProd || Config.isDevTLS) ? `${proto}s` : proto;
  const port = !isProd ? (overridePort || defaultPort) : 80;

  const host = domain + ((port !== 80) ? `:${port}` : '');

  return `${scheme}://${host}`;
};
