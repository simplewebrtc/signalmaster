'use strict';

const Config = require('getconfig');
const Crypto = require('crypto');
const JWT = require('jsonwebtoken');

const Domains = require('./domains');

module.exports = function (kind) {

  return function (request, username, password, h) {

    const sub = Crypto.createHash('sha256').update(username).digest('base64');
    const opts = {
      issuer: Domains.api,
      audience: Domains[kind],
      algorithms: ['HS256']
    };

    let isValid = false;
    let decoded;
    try {
      decoded = JWT.verify(password, Config.auth.secret, opts);
      // Handle pre-hashed subjects for a little while
      if (decoded.sub !== sub && decoded.sub !== username) {
        throw new Error(`JWT subject does not match, expected: ${sub}, got ${username}`);
      }
      isValid = true;
    }
    catch (err) {

      console.warn('Client token failed to validate:', err.message);
    }
    return { isValid, credentials: decoded };
  };
};

