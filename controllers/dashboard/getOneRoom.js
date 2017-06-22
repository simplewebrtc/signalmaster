'use strict';

module.exports = {
  description: 'Dashboard',
  tags: ['api', 'metrics'],
  handler: function (request, reply) {
    const { roomId } = request.params
    console.log(request.params);
      this.db.events.find({ room_id: roomId })
    .then((events) => {
      return reply.view('singleRoom', { resource: roomId, data: events });
    })
  }
};
