'use strict';


const Config = require('getconfig');
const JWT = require('jsonwebtoken');

const inflateDomains = require('./domains');

const TalkyCoreConfig = require('getconfig').talky;
const Domains = inflateDomains(TalkyCoreConfig.domains);


module.exports = function (kind) {
  return function (request, username, password, cb) {

    const opts = {
      issuer: Domains.api,
      audience: Domains[kind],
      subject: username,
      algorithms: [ 'HS256' ]
    };
    
    JWT.verify(password, Config.auth.secret, opts, function (err, decoded) {
      
      if (err) {
        return cb(true);
      }
      cb(null, true, decoded); 
    });
  };
};
