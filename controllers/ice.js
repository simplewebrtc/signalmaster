'use strict';

const FetchICE = require('../lib/fetch_ice');
const LookupOrg = require('../lib/lookup_org');
const Schema = require('../lib/schema');

module.exports = {
  description: 'Provide ICE servers and credentials',
  tags: ['api', 'ice'],
  handler: async function (request, h) {

    const session = request.auth.credentials;

    const org = await LookupOrg({ orgId: session.orgId, redis: this.redis });
    if (!org) {
      return Boom.forbidden('Account not enabled');
    }

    const result = FetchICE({ org, session_id: session.id });
    return result;
  },
  response: {
    status: {
      200: Schema.iceServers
    }
  },
  auth: 'client-token'
};
