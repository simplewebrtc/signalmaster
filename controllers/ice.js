'use strict';

const fetchICE = require('../lib/fetchIce');


module.exports = {
  description: 'Provide ICE servers and credentials',
  tags: ['api', 'ice'],
  handler: function (request, reply) {

    return reply(fetchICE());
  },
  auth: 'client-token'
};

