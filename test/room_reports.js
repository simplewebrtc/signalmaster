'use strict';

const Lab = require('@hapi/lab');
const Code = require('code');
const Cheerio = require('cheerio');
const Fixtures = require('./fixtures');
const { promisify } = require('util');
const { roomReports, eventWorker, db, redis, Server } = Fixtures;
const timeout = promisify(setTimeout);

const lab = exports.lab = Lab.script();

const { describe, it, before, after } = lab;
const { expect } = Code;

const redis_get = promisify(redis.get);
const redis_set = promisify(redis.set);
const redis_del = promisify(redis.del);

describe('room reports', () => {

  let server;
  const room = Fixtures.room();
  const user1 = Fixtures.session();
  const user2 = Fixtures.session();
  const user3 = Fixtures.session();
  room.room_id = room.id;
  delete room.id;

  before(async () => {

    server = await Server;
    await redis_del('rooms_destroyed');
    await redis_del('events');
    await redis_del('events_clock');
  });

  after(async () => {

    await Promise.all([
      db.rooms.destroy({ id: room.room_id }),
      db.events.destroy({ room_id: room.room_id }),
      eventWorker.stop(),
      roomReports.stop()
    ]);
  });

  it('processes room events', async () => {

    const headers = {
      authorization: Fixtures.prosodyBasicHeader('testUser')
    };
    await server.inject({ method: 'POST', url: '/prosody/telemetry', payload: {
      eventType: 'room_created', data: room
    }, headers });
    //user1 joins
    await server.inject({ method: 'POST', url: '/prosody/telemetry', payload: {
      eventType: 'occupant_joined', data: { session_id: user1.id, room_id: room.room_id }
    }, headers });
    //user2 joins
    await server.inject({ method: 'POST', url: '/prosody/telemetry', payload: {
      eventType: 'occupant_joined', data: { session_id: user2.id, room_id: room.room_id }
    }, headers });
    //user1 leaves
    await server.inject({ method: 'POST', url: '/prosody/telemetry', payload: {
      eventType: 'occupant_left', data: { session_id: user1.id, room_id: room.room_id }
    }, headers });
    //user3 joins
    await server.inject({ method: 'POST', url: '/prosody/telemetry', payload: {
      eventType: 'occupant_joined', data: { session_id: user3.id, room_id: room.room_id }
    }, headers });
    //room destroyed
    await server.inject({ method: 'POST', url: '/prosody/telemetry', payload: {
      eventType: 'room_destroyed', data: room
    }, headers });
    await eventWorker.start();
    await timeout(100);
    await eventWorker.stop();
    //need to check that the clock is set
    const event_clock = await redis_get('events_clock');
    expect(event_clock).to.exist();

    //fudge the clock six minutes in the future so the reports run
    await redis_set('events_clock', Number(event_clock) + (6 * 60 * 1000));
    await roomReports.start();
    await timeout(100);
    await roomReports.stop();
    const res = await Fixtures.getAdminUrl(server, `/dashboard/rooms/${room.room_id}`);
    expect(res.statusCode).to.equal(200);
    const $ = Cheerio.load(res.result);
    const roomInfo = $('td').map(function () {

      return $(this).text().trim();
    }).get();
    expect(roomInfo[8]).to.equal('2'); //Largest Room Size
    expect(roomInfo[9]).to.equal('3'); //Total Occupants Joined
  });
});
