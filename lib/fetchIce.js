'use strict';

const Config = require('getconfig');
const Crypto = require('crypto');
const Wreck = require('wreck');

const ICE_CONFIG = Config.talky.ice;

module.exports = (request) => {
  const username = `${Math.floor(Date.now() / 1000) + 86400}`;
  const credential = Crypto.createHmac('sha1', Buffer.from(ICE_CONFIG.secret)).update(username).digest('base64');

  return new Promise((resolve, reject) => {

    // TODO: Make this a random selection. Shuffle first? Retry with next if 404/error.
    Wreck.get(ICE_CONFIG.servers[0] + '/ice-servers.json', { json: 'force' }, (err, resp, servers) => {

      if (err) {
        request.log(['error', 'fetchIce'], err);
        return resolve([]);
      }

      return resolve(servers.map(server => {
        if (server.type === 'turn' || server.type === 'turns') {
          server.username = username;
          server.password = credential;
        }
        return server;
      }));
    });
  });
};

