'use strict';

const Duration = require('humanize-duration');
const Boom = require('boom');

module.exports = {
  description: 'Dashboard',
  tags: ['web', 'metrics'],
  auth: 'admin',
  handler: async function (request, reply) {

    const { id } = request.params;

    const room = await this.db.rooms.findOne({ id });

    if (!room) {
      throw Boom.notFound();
    }

    const [events, similarPrev, similarNext] = await Promise.all([
      this.db.events.for_room({ room_id: id }),
      this.db.rooms.get_similar_prev({
        name: room.name,
        interval: 5,
        created_at: room.created_at,
        ended_at: room.ended_at
      }),
      this.db.rooms.get_similar_next({
        name: room.name,
        interval: 5,
        created_at: room.created_at,
        ended_at: room.ended_at
      })
    ]);

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
