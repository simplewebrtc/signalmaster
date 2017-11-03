'use strict';

const FetchICE = require('../../lib/fetch_ice');
const Schema = require('../../lib/schema');

module.exports = {
  description: 'Provide ICE servers and credentials',
  tags: ['api', 'ice'],
  handler: function (request, reply) {

    const session = request.auth.credentials;
    return reply(FetchICE(session.orgId, session.id));
  },
  response: {
    status: {
      200: Schema.iceServers
    }
  },
  auth: 'client-token'
};

