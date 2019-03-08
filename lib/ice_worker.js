'use strict';

const Config = require('getconfig');
const { promisify } = require('util');

const internals = {};

internals.empty_event = {
  created_at: null,
  server: null,
  org_id: null,
  session_id: null,
  bytes_sent: 0,
  bytes_received: 0
};


class ICEWorker {

  constructor(options) {

    this.working = Promise.resolve();
    this.timeout = 1000; // 1 second
    this.batch = 25; // 25 events at a time
    this.db = options.db;
    this.run = false;
    this.redis = options.redis;
    this.redis_lrange = promisify(this.redis.lrange.bind(this.redis));
    this.redis_ltrim = promisify(this.redis.ltrim.bind(this.redis));
    this.redis_set = promisify(this.redis.set.bind(this.redis));
    this.redis_hincrby = promisify(this.redis.hincrby.bind(this.redis));
    this.redis_sadd = promisify(this.redis.sadd.bind(this.redis));
    this.redis_delete = promisify(this.redis.del.bind(this.redis));
    this.redis_rpush = promisify(this.redis.rpush.bind(this.redis));
  }

  async start() {

    // Await stop()
    await this.stop();

    // Reset stats counters
    await Promise.all([
      this.redis_delete('ice_count_by_server'),
      this.redis_delete('ice_usage_by_server_recv'),
      this.redis_delete('ice_usage_by_server_sent'),
      this.redis_delete('ice_count_by_server'),
      this.redis_delete('ice_usage_by_org_recv'),
      this.redis_delete('ice_usage_by_org_sent'),
      this.redis_delete('ice_count_by_org')
    ]);

    this.run = true;
    this.work();
  }

  async stop() {

    this.run = false;
    await this.working;
  }

  //Main worker loop
  async work() {

    await this.working; //Make sure our former self is done
    if (this.run) {
      this.working = new Promise(async (resolve, reject) => {

        const events = await this.redis_lrange('ice_events', 0, this.batch - 1);
        if (events.length) {
          for (const event_json of events) {
            const event = { ...internals.empty_event, ...JSON.parse(event_json) }; //Set nulls where needed

            await this.update_ice_state(event);

            const clock = Number(new Date(event.created_at));
            await this.redis_set('ice_events_clock', clock);
          }

          await this.redis_ltrim('ice_events', events.length, -1);
          if (events.length === this.batch) {
            setImmediate(this.work.bind(this)); //immediately try again
            resolve();
            return;
          }
        }

        setTimeout(this.work.bind(this), this.timeout); //try again after a period of time
        resolve();
      });
    }
  }

  async update_ice_state(event) {

    let success = true;
    if (event.bytes_received === 0 && event.bytes_sent === 0) {
      // A lot of TURN allocations get created that don't actually get used.
      return success;
    }

    try {

      if (event.session_id) {
        await this.db.sessions.updateOne({ id: event.session_id }, {
          used_turn: true
        });
      }

      await Promise.all([
        this.redis_hincrby('ice_usage_by_server_recv', event.server, event.bytes_received),
        this.redis_hincrby('ice_usage_by_server_sent', event.server, event.bytes_sent),
        this.redis_hincrby('ice_count_by_server', event.server, 1),
        this.redis_hincrby('ice_usage_by_org_recv', event.org_id, event.bytes_received),
        this.redis_hincrby('ice_usage_by_org_sent', event.org_id, event.bytes_sent),
        this.redis_hincrby('ice_count_by_org', event.org_id, 1)
      ]);

      if (Config.billing.ice) {
        await this.redis_rpush('ice_usage', JSON.stringify(event));
      }
    }
    catch (err) {

      console.log(err.stack);
      success = false;
    }

    return success;
  }
}

module.exports = ICEWorker;
