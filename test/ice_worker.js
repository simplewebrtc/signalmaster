'use strict';

const Lab = require('@hapi/lab');
const Code = require('code');
const { promisify } = require('util');
const timeout = promisify(setTimeout);
const Fixtures = require('./fixtures');
const { iceWorker, redis } = Fixtures;

const lab = exports.lab = Lab.script();

const { describe, it, before, after } = lab;
const { expect } = Code;

const redis_rpush = promisify(redis.rpush);
const redis_hgetall = promisify(redis.hgetall);

describe('ice worker', () => {

  const events = [];
  const main_event = Fixtures.iceEvent({ bytes_sent: 100, bytes_received: 100 });
  for (let i = 0; i < 10; i++) {
    const event = Fixtures.iceEvent({ server: main_event.server, org_id: main_event.org_id });
    events.push(event);
  }

  before(async () => {

    await redis_rpush('ice_events', JSON.stringify(main_event));
    for (const event of events) {
      await redis_rpush('ice_events', JSON.stringify(event));
    }
  });

  after(async () => {

    await iceWorker.stop();
  });

  it('processes events', async () => {

    iceWorker.batch = 6;
    await iceWorker.start();
    await timeout(250); //hack way to try to let it drain the queue
    await iceWorker.stop();

    const iceServerSent = await redis_hgetall('ice_usage_by_server_sent');
    const iceServerRecv = await redis_hgetall('ice_usage_by_server_recv');
    const iceOrgSent = await redis_hgetall('ice_usage_by_org_sent');
    const iceOrgRecv = await redis_hgetall('ice_usage_by_org_recv');

    expect(iceServerSent[main_event.server]).above(100);
    expect(iceServerRecv[main_event.server]).above(100);

    expect(iceOrgSent[main_event.org_id]).above(100);
    expect(iceOrgRecv[main_event.org_id]).above(100);
  });
});
