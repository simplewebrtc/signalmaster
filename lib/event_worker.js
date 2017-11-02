'use strict';

const { promisify } = require('util');

const internals = {};

internals.empty_event = {
  room_id: null,
  actor_id: null,
  peer_id: null
};

class EventWorker {

  constructor(options) {

    this.working = Promise.resolve();
    this.timeout = 10000;//10 seconds
    this.batch = 25; //25 events at a time
    this.db = options.db;
    this.run = false;
    this.redis = options.redis;
    this.redis_lrange = promisify(this.redis.lrange.bind(this.redis));
    this.redis_ltrim = promisify(this.redis.ltrim.bind(this.redis));
    this.redis_set = promisify(this.redis.set.bind(this.redis));
    this.redis_rpush = promisify(this.redis.rpush.bind(this.redis));
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

        const events = await this.redis_lrange('events', 0, this.batch - 1);
        if (events.length) {
          let counter = 1; //Yep, 1 based offsets.
          const values = [];
          const params = [];
          for (const event_json of events) {
            const event = { ...internals.empty_event, ...JSON.parse(event_json) }; //Set nulls where needed
            params.push(event.type, event.room_id, event.actor_id, event.peer_id, event.created_at, event.updated_at);
            values.push(`(\$${counter},\$${counter + 1},\$${counter + 2},\$${counter + 3},\$${counter + 4},\$${counter + 5})`);
            counter = counter + 6;
            if (event.type === 'room_destroyed') {
              await this.redis_rpush('rooms_destroyed', JSON.stringify(event));
            }
            const clock = Number(new Date(event.created_at));
            await this.redis_set('events_clock', clock); //TODO is this really the best way to do this?
          }
          const inserted = await this.insert(values, params);
          //If this failed we have logged it and will try again in a moment
          if (inserted) {
            await this.redis_ltrim('events', this.batch, -1);
            if (events.length === this.batch) {
              setImmediate(this.work.bind(this)); //immediately try again
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

  async insert(values, params) {

    let success = true;
    const query = `INSERT INTO events (type, room_id, actor_id, peer_id, created_at, updated_at) VALUES ${values.join(', ')} RETURNING id`;
    try {
      await this.db.query(query, params);
    }
    catch (e) {

      console.log(e.stack);
      success = false;
    }
    return success;
  };
};

module.exports = EventWorker;
