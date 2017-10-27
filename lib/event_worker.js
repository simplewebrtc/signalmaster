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
    this.lrange = promisify(this.redis.lrange);
    this.ltrim = promisify(this.redis.ltrim);
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

        const events = await this.lrange('events', 0, this.batch - 1);
        if (events) {
          let counter = 1; //Yep, 1 based offsets.
          const values = [];
          const params = [];
          for (const event_json of events) {
            const event = { ...internals.empty_event, ...JSON.parse(event_json) }; //Set nulls where needed
            params.push(event.type, event.room_id, event.actor_id, event.peer_id);
            values.push(`(\$${counter},\$${counter + 1},\$${counter + 2},\$${counter + 3},now(),now())`);
            counter = counter + 4;
          }
          const inserted = await this.insert(values, params);
          if (inserted) { //TODO what to do if error?
            await this.ltrim('events', this.batch, -1);
            if (events.length === this.batch) {
              setImmediate(this.work.bind(this)); //immediately try again
              resolve();
              return;
            }
          }
          else {
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
