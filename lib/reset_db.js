'use strict';

const { promisify } = require('util');

module.exports = async function (db, redis) {

  const now = new Date();
  const rpush = promisify(redis.rpush.bind(redis));

  // Synthesize room_destroyed events for any rooms that
  // were still active when the system was shutdown.
  const rooms = await db.rooms.active();

  for (const room of rooms) {

    const event = {
      type: 'room_destroyed',
      room_id: room.id,
      created_at: now,
      updated_at: now
    };
    await rpush('events', JSON.stringify(event));
  };

  // Synthesize user_offline events for any user sessions that
  // were still active when the system was shutdown.
  const sessions = await db.sessions.active();

  for (const session of sessions) {

    const event = {
      type: 'user_offline',
      actor_id: session.id,
      created_at: now,
      updated_at: now
    };
    await rpush('events', JSON.stringify(event));
  }
};

