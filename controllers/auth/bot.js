'use strict';

module.exports = {
  description: 'Prosody authentication check for bot sessions',
  tags: ['api', 'prosody', 'auth'],
  handler: function (request, reply) {

    return reply('true').code(200);
  },
  validate: {
  }
};
