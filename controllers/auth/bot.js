'use strict';

module.exports = {
  description: 'Prosody authentication check for bot sessions',
  tags: ['api', 'prosody', 'auth'],
  handler: function (request, h) {

    return h.response('true').type('text/plain').code(200);
  },
  auth: 'prosody-bots'
};
