'use strict';

const Config = require('getconfig');
const JWT = require('jsonwebtoken');

const InflateDomains = require('./domains');

const TalkyCoreConfig = require('getconfig').talky;
const Domains = InflateDomains(TalkyCoreConfig.domains);

module.exports = function (kind) {

  return function (request, username, password, h) {

    const opts = {
      issuer: Domains.api,
      audience: Domains[kind],
      subject: username,
      algorithms: ['HS256']
    };

    let isValid = false;
    let decoded;
    try {
      decoded = JWT.verify(password, Config.auth.secret, opts);
      isValid = true;
    }
    catch (err) {

      console.error('AUTH3 ERROR', password, decoded);
    }
    return { isValid, credentials: decoded };
  };
};

