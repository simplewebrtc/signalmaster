'use strict';

const Schema = require('../lib/schema');

module.exports = {
  description: 'Service health check',
  tags: ['api'],
  handler: function (request, h) {

    return { status: 'ok' };
  },
  response: {
    status: {
      200: Schema.healthCheck
    }
  }
};

