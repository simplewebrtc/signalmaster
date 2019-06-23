'use strict';

const Lab = require('@hapi/lab');
const Code = require('code');
const { promisify } = require('util');
const timeout = promisify(setTimeout);
const Fixtures = require('./fixtures');
const { eventWorker, redis, db } = Fixtures;

const lab = exports.lab = Lab.script();

const { describe, it, before, after } = lab;
const { expect } = Code;

const redis_rpush = promisify(redis.rpush);

describe('event worker', () => {

  const events = [];
  const main_event = Fixtures.event({ type: 'room_created' });
  for (let i = 0; i < 10; i++) {
    const event = Fixtures.event({ room_id: main_event.room_id, type: `action_${i}` });
    events.push(event);
  }

  before(async () => {

    await redis_rpush('events', JSON.stringify(main_event));
    for (const event of events) {
      await redis_rpush('events', JSON.stringify(event));
    }
  });

  after(async () => {

    await db.events.destroy({ room_id: main_event.room_id, type: main_event.type });
    for (const event of events) {
      await db.events.destroy({ room_id: event.room_id, type: event.type });
    }
    await eventWorker.stop();
  });

  it('processes events', async () => {

    eventWorker.batch = 6;
    await eventWorker.start();
    await timeout(250); //hack way to try to let it drain the queue
    await eventWorker.stop();
    const db_main_event = await db.events.findOne({ room_id: main_event.room_id, type: main_event.type });
    expect(db_main_event).to.exist();
    expect(db_main_event.created_at).to.equal(db_main_event.created_at);
    expect(db_main_event.updated_at).to.equal(db_main_event.updated_at);
    for (const event of events) {
      const db_event = await db.events.findOne({ room_id: event.room_id, type: event.type });
      expect(db_event).to.exist();
      expect(db_event.created_at).to.equal(event.created_at);
      expect(db_event.updated_at).to.equal(event.updated_at);
    }
  });
});
