'use strict';

module.exports = {
  description: 'Proxy to Prosody for signaling.',
  notes: 'WebSocket clients will send upgrade headers and be upgraded to a websocket',
  tags: ['api', 'websocket'],
  handler: function (request, reply) {

    //$lab:coverage:off$
    reply('This route is for websocket upgrading');
    //$lab:coverage:on$
  }
};

