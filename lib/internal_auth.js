'use strict';

const Config = require('getconfig');
const Crypto = require('crypto');


module.exports = function (request, username, password, cb) {

  const credential = Crypto.createHmac('sha1', Buffer.from(Config.auth.secret)).update(username).digest('base64');
  return cb(null, password === credential, {});
};

