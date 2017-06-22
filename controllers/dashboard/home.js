'use strict';

module.exports = {
  description: 'Dashboard',
  tags: ['api', 'metrics'],
  handler: function (request, reply) {
    this.db.rooms.find({})
    .then((rooms) => {
      return reply.view('home', { data: rooms });
    })
  }
};