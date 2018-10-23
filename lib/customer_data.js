'use strict';

const Boom = require('boom');
const JWT = require('jsonwebtoken');

module.exports = function (token, apiKey) {

  // LAUNCH TODO drop this once all org accounts have secrets
  if (!apiKey) {
    return JWT.decode(token);
  }

  let customerData;
  try {
    customerData = JWT.verify(token, apiKey, { algorithms: ['HS256'] });
  }
  catch (err) {
    console.error(err);
    throw Boom.badRequest('Could not parse user data');
  }
  return customerData;
};
