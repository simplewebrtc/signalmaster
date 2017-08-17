'use strict';

const Config = require('getconfig');
const Crypto = require('crypto');
const Shuffle = require('array-shuffle');
const Wreck = require('wreck');

const ICE_CONFIG = Config.talky.ice;


const fetchIceEndpoints = async (host, username, credential) => {

  return new Promise((resolve, reject) => {

    Wreck.get(`${host}/ice-servers.json`, { json: 'force' }, (err, resp, fetchedServers) => {

      if (err) {
        return reject(err);
      }

      return resolve(fetchedServers.map((server) => {

        if (server.type === 'turn' || server.type === 'turns') {
          server.username = username;
          server.password = credential;
        }
        return server;
      }));
    });
  });
};


module.exports = async (request, servers) => {

  const username = `${Math.floor(Date.now() / 1000) + 86400}`;
  const credential = Crypto.createHmac('sha1', Buffer.from(ICE_CONFIG.secret)).update(username).digest('base64');
  const serverList = Shuffle(servers || ICE_CONFIG.servers);

  for (const pickedServer of serverList) {
    try {
      return await fetchIceEndpoints(pickedServer, username, credential);
    }
    catch (err) {
      if (request) {
        request.log(['error', 'fetchIce'], err);
      }
    }
  }

  return [];
};

