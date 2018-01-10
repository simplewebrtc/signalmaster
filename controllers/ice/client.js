'use strict';

const FetchICE = require('../../lib/fetch_ice');
const Schema = require('../../lib/schema');

module.exports = {
  description: 'Provide ICE servers and credentials',
  tags: ['api', 'ice'],
  handler: function (request, h) {

    const session = request.auth.credentials;
    const result = FetchICE(session.orgId, session.id);
    return result;
  },
  response: {
    status: {
      200: Schema.iceServers
    }
  },
  auth: 'client-token'
};

