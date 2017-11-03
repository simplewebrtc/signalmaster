'use strict';

const { promisify } = require('util');


module.exports = function (db, redis) {

  const now = new Date();
  const rpush = promisify(redis.rpush.bind(redis));


  // Synthesize room_destroyed events for any rooms that
  // were still active when the system was shutdown.
  const roomCleanup = db.rooms.active().then((rooms) => {

    const events = rooms.map((room) => {

      const event = {
        type: 'room_destroyed',
        room_id: room.id,
        created_at: now,
        updated_at: now
      };
      return rpush('events', JSON.stringify(event));
    });

    return Promise.all(events);
  });


  // Synthesize user_offline events for any user sessions that
  // were still active when the system was shutdown.
  const sessionCleanup = db.sessions.active().then((sessions) => {

    const events = sessions.map((session) => {

      const event = {
        type: 'user_offline',
        actor_id: session.id,
        created_at: now,
        updated_at: now
      };
      return rpush('events', JSON.stringify(event));
    });

    return Promise.all(events);
  });


  return Promise.all([roomCleanup, sessionCleanup]);
};

