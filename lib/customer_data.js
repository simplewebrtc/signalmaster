'use strict';

const Boom = require('boom');
const JWT = require('jsonwebtoken');

module.exports = function (token, apiSecrets) {

  let customerData;

  // Assumption: apiSecrets is sorted such that the newest secret will be
  // tried first.
  for (const secret of apiSecrets) {
    try {
      customerData = JWT.verify(token, secret, { algorithms: ['HS256'] });
      break;
    }
    catch (err) {
      console.error(err);
    }
  }

  if (!customerData) {
    throw Boom.badRequest('Could not parse user data');
  }

  return customerData;
};
