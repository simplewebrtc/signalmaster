'use strict';

const Boom = require('boom');
const JWT = require('jsonwebtoken');

module.exports = function ({ token, apiSecrets }) {

  // Assumption: apiSecrets is sorted such that the newest secret will be
  // tried first.
  //
  // We only check the first 10 secrets to prevent denial of service.
  const secrets = apiSecrets.slice(0, 10);

  let customerData;
  for (const secret of secrets) {
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
