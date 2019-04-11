'use strict';

const Config = require('getconfig');

module.exports = function buildUrl({ proto, domain, overridePort }) {

  const isProd = Config.getconfig.env === 'production';
  const defaultPort = Config.server ? Config.server.port : 80;

  const scheme = isProd ? `${proto}s` : proto;
  const port = isProd ? 80 : (overridePort || defaultPort);

  const host = domain + ((port !== 80) ? `:${port}` : '');

  return `${scheme}://${host}`;
};
