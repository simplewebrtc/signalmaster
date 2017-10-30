'use strict';

const FetchICE = require('../../lib/fetch_ice');
const Schema = require('../../lib/schema');

module.exports = {
  description: 'Provide ICE servers and credentials to Prosody',
  tags: ['api', 'ice'],
  handler: function (request, reply) {

    return reply(FetchICE(request));
  },
  response: {
    status: {
      200: Schema.iceServers
    }
  },
  auth: 'internal-api'
};

