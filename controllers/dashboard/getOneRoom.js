'use strict';

const Duration = require('humanize-duration');


module.exports = {
  description: 'Dashboard',
  tags: ['api', 'metrics'],
  handler: async function (request, reply) {
    const { roomId } = request.params

    const room = await this.db.rooms.findOne({ roomid: roomId });
    const events = await this.db.events.find({ room_id: roomId });
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

    for (let roomData of [room, similarPrev, similarNext]) {
      if (!roomData) {
        continue;
      }
      
      roomData.duration = Duration((roomData.ended_at || new Date()).getTime() - roomData.created_at.getTime());

      if (roomData === room) {
        continue;
      }
      if(roomData.ended_at) {
        if (roomData.ended_at.getTime() < room.created_at.getTime()) {
          roomData.delta = Duration(room.created_at.getTime() - roomData.ended_at.getTime());
        } else if (roomData.created_at.getTime() > room.ended_at.getTime()) {
          roomData.delta = Duration(roomData.created_at.getTime() - room.ended_at.getTime());
        }
      }
    }

    let totalUsers = 0;
    let activeUsers = 0;
    let users = new Set();
    for (const event of events) {
      if (event.type === 'occupant_joined') {
        totalUsers += 1;
        users.add(event.actor_id);
        activeUsers = Math.max(users.size, activeUsers);
      }
    }
    
    return reply.view('singleRoom', {
      resource: roomId,
      room,
      similarPrev,
      similarNext,
      totalUsers,
      activeUsers,
      data: events
    });
  }
};
