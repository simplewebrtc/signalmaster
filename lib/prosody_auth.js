'use strict';

const Config = require('getconfig');
const Crypto = require('crypto');
const JWT = require('jsonwebtoken');

const InflateDomains = require('./domains');

const TalkyCoreConfig = require('getconfig').talky;
const Domains = InflateDomains(TalkyCoreConfig.domains);

module.exports = function (kind) {

  return function (request, username, password, cb) {

    if (kind === 'api') {
      const credential = Crypto.createHmac('sha1', Buffer.from(Config.auth.secret)).update(username).digest('base64');
      return cb(null, password === credential, {});
    }

    const opts = {
      issuer: Domains.api,
      audience: Domains[kind],
      subject: username,
      algorithms: ['HS256']
    };

    JWT.verify(password, Config.auth.secret, opts, (err, decoded) => {

      if (err) {
        return cb(null, false);
      }
      cb(null, true, decoded);
    });
  };
};

