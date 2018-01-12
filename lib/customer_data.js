'use strict';

const Config = require('getconfig');
const Boom = require('boom');
const JWT = require('jsonwebtoken');

module.exports = function (token) {

  let customerData;
  try {
    customerData = JWT.verify(token, Config.talky.apiKey, { algorithm: 'HS256' });
  }
  catch (err) {
    throw Boom.badRequest('Could not parse user data');
  }
  return customerData;
};
