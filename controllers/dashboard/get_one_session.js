'use strict';

const Duration = require('humanize-duration');
const Boom = require('boom');

module.exports = {
  description: 'Dashboard',
  tags: ['web', 'metrics'],
  auth: 'admin',
  handler: async function (request, reply) {

    const { id } = request.params;
    let session = {};

    try {
      session = await this.db.sessions.findOne({ id });
    }
    catch (err) {
      request.log(['error', 'getOneSession'], err);
    }

    if (!session) {
      throw Boom.notFound();
    }

    session.duration = Duration((session.ended_at || new Date(Date.now())).getTime() - session.created_at.getTime());

    const events = await this.db.events.find({ actor_id: id });

    return reply.view('single_session', { session, data: events });
  }
};
