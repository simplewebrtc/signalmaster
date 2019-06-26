'use strict';

const Config = require('getconfig');
const Crypto = require('crypto');

const ICE_CONFIG = Config.talky.ice;


module.exports = ({ org, session_id }) => {

  const org_id = org.key;
  const expiresTime = Math.floor(Date.now() / 1000) + (org.iceExpiration || 86400);
  const expires = new Date(expiresTime * 1000).toISOString();

  const username = `${expiresTime}:${org_id}/${session_id}`;
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
      password: credential,
      expires
    },
    {
      type: 'turn',
      host: server,
      port: 3478,
      transport: 'tcp',
      username,
      password: credential,
      expires
    },
    {
      type: 'turns',
      host: server,
      port: 443,
      transport: 'tcp',
      username,
      password: credential,
      expires
    }
  ];
};
