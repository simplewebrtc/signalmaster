'use strict';

const { promisify } = require('util');

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
      this.working = new Promise((resolve, reject) => {
        const events = await this.lrange(0, this.batch - 1);
        if (events) {
          const values = events.map((event_json) => {

            const event = JSON.parse(event_json);
            return `(\$${event.type}, \$${event.room_id}, \$${event.actor_id}, \$${event.peer_id}, now(), now())`;

          });
          const inserted = await this.insert(values);
          if (inserted) { //TODO what to do if error?
            await this.ltrim(0, this.batch);
            if (events.length === this.batch) {
              setImmediate(this.work); //immediately try again
              resolve();
              return;
            }
          }
        }
        setTimeout(this.work, this.timeout); //try again after a period of time
        resolve();
      });
    }
  };

  async insert(values) {

    let error = false;
    try {
      await this.db.query('INSERT INTO events (type, room_id, actor_id, peer_id, created_at, updated_at} VALUES `${values.join(', ')`');
    }
    catch (e) {

      console.log(e.stack);
      error = true;
    }
    return error;
  };
};

module.exports = EventWorker;
