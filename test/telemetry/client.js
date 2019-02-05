'use strict';

const Lab = require('lab');
const Code = require('code');
const { promisify } = require('util');
const Fixtures = require('../fixtures');
const { redis, db, Server } = Fixtures;
//const Cheerio = require('cheerio');
//const Crypto = require('crypto');

const lab = exports.lab = Lab.script();

const { describe, it, before, afterEach, after } = lab;
const { expect } = Code;

describe('POST /telemetry', () => {

  let server;
  const session = Fixtures.session();
  const newRoom = Fixtures.room();
  newRoom.room_id = newRoom.id;
  delete newRoom.id;

  before(async () => {

    server = await Server;
    await db.sessions.insert(session);
  });

  afterEach(async () => {

    await promisify(redis.del)('events');
  });

  after(async () => {

    await db.sessions.destroy({ id: session.id });
    await db.rooms.destroy({ id: newRoom.room_id });
    await db.events.destroy({ room_id: newRoom.room_id });
  });

  it('unauthorized', () => {

    const payload = {
      eventType: 'video_paused',
      data: {}
    };
    return server.inject({ method: 'POST', url: '/telemetry', payload })
      .then((res) => {

        expect(res.statusCode).to.equal(401);
      });
  });

  it('inserts event', () => {

    const prosodyPayload = {
      eventType: 'room_created',
      data: newRoom
    };
    const headers = {
      authorization: Fixtures.prosodyBasicHeader('testUser')
    };

    const clientPayload = {
      eventType: 'video_paused',
      roomId: newRoom.room_id
    };
    return server.inject({ method: 'POST', url: '/prosody/telemetry', payload: prosodyPayload, headers })
      .then((res) => {

        expect(res.statusCode).to.equal(200);
        return server.inject({ method: 'POST', url: '/telemetry', payload: clientPayload, auth: { credentials: session, strategy: 'client-token' } });
      }).then(async (res) => {

        expect(res.statusCode).to.equal(200);
        let event = await promisify(redis.lindex)('events', 1);
        expect(event).to.exist();
        event = JSON.parse(event);
        expect(event).to.include({ type: 'video_paused', room_id: newRoom.room_id });
      });
    //This will have to move to the worker tests
    //return Fixtures.getAdminUrl(server, `/dashboard/rooms/${newRoom.room_id}`);
    //}).then((res) => {

    //expect(res.statusCode).to.equal(200);
    //return res.result;
    //}).then((result) => {

    //const $ = Cheerio.load(result);
    //const roomInfo = $('td').map(function () {

    //return $(this).text().trim();
    //}).get();
    //expect(roomInfo).to.include(newRoom.room_id); // Resource
    //expect(roomInfo).to.include(Crypto.createHash('sha1').update(newRoom.name).digest('base64')); // Name
    //expect(roomInfo).to.include('video_paused');
    //return db.rooms.destroy({ id: newRoom.room_id });
    //});
  });
});
