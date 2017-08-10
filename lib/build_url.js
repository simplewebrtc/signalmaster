'use strict';

const Config = require('getconfig');

module.exports = function buildUrl(proto, domain, overridePort) {

  const scheme = Config.isDevTLS ? `${proto}s` : proto;
  const port = (Config.getconfig.isDev ? (overridePort || Config.server.port) : 80);

  const host = domain + ((port !== 80) ? `:${port}` : '');

  return `${scheme}://${host}`;
};
