'use strict';

const Boom = require('@hapi/boom');
const Config = require('getconfig');
const Crypto = require('crypto');
const JWT = require('jsonwebtoken');

const Domains = require('./domains');
const LookupOrg = require('./lookup_org');

module.exports = function (kind, redis) {

  return async function (request, username, password, h) {

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
        throw Boom.forbidden(`JWT subject does not match, expected: ${sub}, got ${username}`);
      }
      const org = await LookupOrg({ orgId: decoded.orgId, redis });
      if (!org) {
        throw Boom.forbidden('Account not enabled');
      }

      isValid = true;
    }
    catch (err) {

      console.warn('Prosody client authentication token failed to validate:', err.message);
      isValid = false;
    }
    return { isValid, credentials: decoded };
  };
};

