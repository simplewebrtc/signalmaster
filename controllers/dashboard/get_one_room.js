'use strict';

const Duration = require('humanize-duration');
const Boom = require('boom');

module.exports = {
  description: 'Dashboard',
  tags: ['web', 'metrics'],
  handler: async function (request, reply) {

    const { id } = request.params;

    const room = await this.db.rooms.findOne({ id });

    if (!room) {
      throw Boom.notFound();
    }

    const events = await this.db.events.find({ room_id: id });
    events.sort((a, b) => {

      return a.created_at > b.created_at ? 1 : a.created_at < b.created_at ? -1 : 0;
    });

    const similarPrev = (await this.db.rooms.get_similar_prev({
      name: room.name,
      interval: 5,
      created_at: room.created_at,
      ended_at: room.ended_at
    }))[0];

    const similarNext = (await this.db.rooms.get_similar_next({
      name: room.name,
      interval: 5,
      created_at: room.created_at,
      ended_at: room.ended_at
    }))[0];

    for (const roomData of [room, similarPrev, similarNext]) {
      if (!roomData) {
        continue;
      }

      roomData.duration = Duration((roomData.ended_at || new Date()).getTime() - roomData.created_at.getTime());

      if (roomData === room) {
        continue;
      }
      if (roomData.ended_at) {
        if (roomData.ended_at.getTime() < room.created_at.getTime()) {
          roomData.delta = Duration(room.created_at.getTime() - roomData.ended_at.getTime());
        }
        else if (roomData.created_at.getTime() > room.ended_at.getTime()) {
          roomData.delta = Duration(roomData.created_at.getTime() - room.ended_at.getTime());
        }
      }
    }

    let totalSessions = 0;
    let activeSessions = 0;
    const sessions = new Set();
    for (const event of events) {
      if (event.type === 'occupant_joined') {
        totalSessions += 1;
        sessions.add(event.actor_id);
        activeSessions = Math.max(sessions.size, activeSessions);
      }
    }

    return reply.view('single_room', {
      resource: id,
      room,
      similarPrev,
      similarNext,
      totalSessions,
      activeSessions,
      data: events
    });
  }
};
