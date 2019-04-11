'use strict';

const Config = require('getconfig');
const JWT = require('jsonwebtoken');

const Domains = require('./domains');

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

      console.warn('Client token failed to validate:', err.message);
    }
    return { isValid, credentials: decoded };
  };
};

