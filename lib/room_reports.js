'use strict';

const { promisify } = require('util');

class RoomReporter {

  constructor(options) {

    this.working = Promise.resolve();
    this.interval = 5;
    this.timeout = 10000;//10 seconds
    this.run = false;
    this.db = options.db;
    this.redis = options.redis;
    this.redis_lindex = promisify(this.redis.lindex.bind(this.redis));
    this.redis_ltrim = promisify(this.redis.ltrim.bind(this.redis));
    this.redis_get = promisify(this.redis.get.bind(this.redis));
    this.redis_lpop = promisify(this.redis.lpop.bind(this.redis));
  };

  async start() {

    //Await stop()
    await this.stop();
    this.run = true;
    this.work();
  };

  async stop() {

    this.run = false;
    await this.working;
  };

  async work() {

    await this.working; //Make sure our former self is done
    if (this.run) {
      this.working = new Promise(async (resolve, reject) => {

        const events_clock = await this.redis_get('events_clock');
        if (events_clock) {
          const room_event  = await this.redis_lindex('rooms_destroyed', 0, this.batch - 1);
          if (room_event) {
            const delay = room_event.created_at - events_clock;
            if (delay > (this.interval * 60 * 1000)) { //this.interval minutes
              const room_processed = await this.process_room(room_event);
              //If this failed we have logged it and will try again in a moment
              if (room_processed) {
                await this.redis_lpop('rooms_destroyed');
                setImmediate(this.work.bind(this)); //immediately try again
                resolve();
                return;
              }
            }
            else {
              setTimeout(this.work.bind(this), delay); //we know how long to wait here
              resolve();
              return;
            }
          }
        }
        setTimeout(this.work.bind(this), this.timeout); //try again after a period of time
        resolve();
      });
    }
  };

  async process_room(room_event) {

    const room = await this.db.rooms.findOne({ id: room_event.room_id });
    const events = await this.db.events.for_room({ room_id: room.id });

    if (!room) {
      //Telemetry creates this in the db before anything so this should be unlikely
      console.log(`Cannot run report on nonexistant room ${room_event.room_id}`);
      return false;
    }

    const total_sessions = new Set();
    const active_sessions = new Set();
    let max_active_sessions = 0;
    for (const event of events) {
      if (event.type === 'occupant_joined') {
        total_sessions.add(event.actor_id);
        active_sessions.add(event.actor_id);
        max_active_sessions = Math.max(active_sessions.size, max_active_sessions);
      }
      else if (event.type === 'occupant_left') {
        active_sessions.delete(event.actor_id);
      }
    }
    const reports = {
      totalSessions: total_sessions.size,
      activeSessions: max_active_sessions
    };
    let success = true;
    try {
      await this.db.rooms.update({ id: room.id }, { reports });
    }
    catch (e) {
      console.log(e.stack);
      success = false;
    }
    return success;
  };
};

module.exports = RoomReporter;
