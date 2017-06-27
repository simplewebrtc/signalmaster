'use strict';

const Duration = require('humanize-duration');


module.exports = {
  description: 'Dashboard',
  tags: ['api', 'metrics'],
  handler: async function (request, reply) {
    const { userSessionId } = request.params;
    let user = {};

    try {
      user = await this.db.users.findOne({ sessionid: userSessionId });
    } catch (err) {
      console.log(err);
    }
    const events = await this.db.events.find({ actor_id: userSessionId });

    user.duration = Duration((user.ended_at || new Date(Date.now())).getTime() - user.created_at.getTime());

    return reply.view('singleUser', { user, resource: userSessionId, data: events });
  }
};
