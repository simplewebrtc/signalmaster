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

  //Main worker loop
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
            await Promise.all([
              this.check_session(event),
              this.check_room(event)
            ]);
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

  async check_room(event) {

    const { room_id } = event;

    if (!room_id) {
      return;
    }

    if (event.type === 'room_created' && event.room_name) {
      await this.db.tx(async (t) => {

        const room = await t.rooms.exists({ room_id });

        if (!room) {
          const attrs = {
            name: event.room_name,
            id: room_id
          };
          await t.rooms.insert(attrs);
        }
      });
    }

    if (event.type === 'room_destroyed') {
      await this.db.rooms.updateOne({ id: room_id }, { ended_at: event.created_at });
      await this.redis_rpush('rooms_destroyed', JSON.stringify(event));
    }
  };

  // This exists to accommodate existing Talky iOS app users.
  async check_session(event) {

    const session_id = event.actor_id;
    if (event.type === 'user_offline') {
      //Record user ended column
      await this.db.sessions.updateOne({ id: session_id }, {
        ended_at: event.created_at
      });
    }
    else if (event.type === 'user_online') {
      await this.db.tx(async (t) => {

        const session = await t.sessions.exists({ id: session_id });
        if (!session) {
          const attrs = {
            id: session_id,
            user_id: `mobile-user-${session_id}`,
            type: 'mobile'
          };
          await t.sessions.insert(attrs);
        }
      });
      //Record user ended column
      await this.db.sessions.updateOne({ id: session_id }, {
        created_at: event.created_at,
        ended_at: null
      });
    }
    else if (event.type === 'user_created') {
      const attrs = {
        id: session_id,
        user_id: event.user_id,
        type: event.device_type,
        os: event.os,
        useragent: event.useragent,
        browser: event.browser
      };
      const session = await t.sessions.exists({ id: session_id });
      if (!session) {
        await this.db.sessions.insert(attrs);
      }
    }
  }

  //Insert events into database
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
