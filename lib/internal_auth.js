'use strict';

const Config = require('getconfig');
const Crypto = require('crypto');

module.exports = function (request, username, password, h) {

  const credential = Crypto.createHmac('sha1', Buffer.from(Config.auth.secret)).update(username).digest('base64');
  if (password !== credential) {
    console.error('Internal API authentication error');
  }
  const isValid = (password === credential);
  return { isValid, credentials: {} };
};

