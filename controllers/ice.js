'use strict';

const fetchICE = require('../lib/fetchIce');
const Schema = require('../lib/schema');

module.exports = {
  description: 'Provide ICE servers and credentials',
  tags: ['api', 'ice'],
  handler: function (request, reply) {

    return reply(fetchICE(request));
  },
  response: {
    status: {
      200: Schema.iceServers
    }
  },
  auth: 'client-token'
};

