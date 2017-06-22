'use strict';

module.exports = {
  description: 'Dashboard',
  tags: ['api', 'metrics'],
  handler: function (request, reply) {
    const { userSessionId } = request.params
    console.log(request.params);
      this.db.events.find({ actor_id: userSessionId })
    .then((events) => {
      console.log(events);
      return reply.view('singleUser', { resource: userSessionId, data: events });
    })
  }
};
