'use strict';

const Lab = require('lab');
const Code = require('code');
const { promisify } = require('util');
const timeout = promisify(setTimeout);
const Fixtures = require('./fixtures');
const { eventWorker, redis, db } = Fixtures;

const lab = exports.lab = Lab.script();

const { describe, it, before, after } = lab;
const { expect } = Code;

const rpush = promisify(redis.rpush);

describe('event worker', () => {

  const events = [];
  const main_event = Fixtures.event({ type: 'room_created' });
  for (let i = 0; i < 10; i++) {
    const event = Fixtures.event({ room_id: main_event.room_id, type: `action_${i}` });
    events.push(event);
  }

  before(async () => {

    await rpush('events', JSON.stringify(main_event));
    for (const event of events) {
      await rpush('events', JSON.stringify(event));
    }
  });

  after(async () => {

    await db.events.destroy(main_event);
    for (const event of events) {
      await db.events.destroy(event);
    }
  });

  it('processes events', async () => {

    eventWorker.batch = 6;
    await eventWorker.start();
    await timeout(250); //hack way to try to let it drain the queue
    await eventWorker.stop();
    const db_events = await db.events.find();
    expect(db_events.length).to.equal(11);
    expect(db_events).to.part.include(main_event);
    expect(db_events).to.part.include(events);
  });
});
