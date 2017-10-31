'use strict';

const Config = require('getconfig');
const Crypto = require('crypto');

const ICE_CONFIG = Config.talky.ice;


module.exports = (orgId, sessionId) => {

  const username = `${Math.floor(Date.now() / 1000) + 86400}:${orgId}/${sessionId}`;
  const credential = Crypto.createHmac('sha1', Buffer.from(ICE_CONFIG.secret)).update(username).digest('base64');
  const server = ICE_CONFIG.server
    .replace(/^https?:\/\//, '')
    .replace(/:[0-9]+$/, '');

  return [
    {
      type: 'turn',
      host: server,
      port: 3478,
      username,
      password: credential
    },
    {
      type: 'turn',
      host: server,
      port: 3478,
      transport: 'tcp',
      username,
      password: credential
    },
    {
      type: 'turns',
      host: server,
      port: 443,
      transport: 'tcp',
      username,
      password: credential
    }
  ];
};

