'use strict';

const Boom = require('boom');
const JWT = require('jsonwebtoken');

module.exports = function (token, apiKey) {

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
