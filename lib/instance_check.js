'use strict';

const Config = require('getconfig');
const Wreck = require('wreck');
const UUID = require('uuid');


const INSTANCE_ID = UUID.v4();


exports.checkInstance = (domain) => {

  return new Promise((resolve, reject) => {

    const port = (Config.server.port || 80) !== 80 ? `:${Config.server.port}` : '';
    const scheme = Config.TLS && Config.TLS.pemFile && Config.TLS.keyFile ? 'https://' : 'http://';

    Wreck.get(`${scheme}${domain}${port}/instance-check`, { json: 'force' }, (err, resp, check) => {

      if (err) {
        return reject(err);
      }

      if (check.instance === INSTANCE_ID) {
        return resolve(true);
      }

      return reject(new Error('Instance IDs do not match'));
    });
  });
};

exports.getInstanceID = () => {

  return INSTANCE_ID;
};
