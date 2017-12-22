'use strict';

const Config = require('getconfig');
const Crypto = require('crypto');


module.exports = function (request, username, password, cb) {

  const credential = Crypto.createHmac('sha1', Buffer.from(Config.auth.secret)).update(username).digest('base64');
  if (password !== credential) {
    console.error('AUTH ERROR:', username, password, credential);
  }
  return cb(null, password === credential, {});
};

