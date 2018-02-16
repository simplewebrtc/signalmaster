'use strict';

const Config = require('getconfig');
const Boom = require('boom');
const JWT = require('jsonwebtoken');

module.exports = function (token, apiKey = Config.talky.apiKey) {

  let customerData;
  try {
    customerData = JWT.verify(token, apiKey, { algorithm: 'HS256' });
  }
  catch (err) {
    throw Boom.badRequest('Could not parse user data');
  }
  return customerData;
};
