'use strict';

const Duration = require('humanize-duration');
const Boom = require('boom');

module.exports = {
  description: 'Dashboard',
  tags: ['web', 'metrics'],
  handler: async function (request, reply) {
    const { userSessionId } = request.params;
    let user = {};

    try {
      user = await this.db.users.findOne({ sessionid: userSessionId });
    } catch (err) {
      request.log(['error', 'getOneUser'], err);
    }

    if (!user) {
      throw Boom.notFound();
    }
    const events = await this.db.events.find({ actor_id: userSessionId });

    user.duration = Duration((user.ended_at || new Date(Date.now())).getTime() - user.created_at.getTime());

    return reply.view('singleUser', { user, resource: userSessionId, data: events });
  }
};
