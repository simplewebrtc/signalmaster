'use strict';

module.exports = {
  description: 'Prosody authentication check for guest sessions',
  tags: ['api', 'prosody', 'auth'],
  handler: function (request, reply) {

    return reply('true').type('text/plain').code(200);
  },
  auth: 'prosody-guests'
};

