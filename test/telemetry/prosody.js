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

describe('POST /prosody/telemetry', () => {

  let server;
  const session = Fixtures.session();
  const createdRoom = Fixtures.room();
  createdRoom.room_id = createdRoom.id;
  delete createdRoom.id;
  const destroyedRoom = Fixtures.room();
  destroyedRoom.room_id = destroyedRoom.id;
  delete destroyedRoom.id;

  before(async () => {

    server = await Server;
    await db.sessions.insert(session);
  });

  afterEach(async () => {

    await promisify(redis.del)('events');
  });

  after(async () => {

    await Promise.all([
      db.sessions.destroy({ id: session.id }),
      db.rooms.destroy({ id: createdRoom.room_id }),
      db.rooms.destroy({ id: destroyedRoom.room_id }),
      db.events.destroy({ room_id: destroyedRoom.room_id })
    ]);
  });

  describe('room_created', () => {

    it('creates room that exists in dashboard', async () => {

      const payload = {
        eventType: 'room_created',
        data: createdRoom
      };
      const headers = {
        authorization: Fixtures.prosodyBasicHeader('testUser')
      };

      const res = await server.inject({ method: 'POST', url: '/prosody/telemetry', payload, headers });
      expect(res.statusCode).to.equal(200);
      let event = await promisify(redis.lindex)('events', 0);
      expect(event).to.exist();
      event = JSON.parse(event);
      expect(event).to.include({ type: 'room_created', room_id: createdRoom.room_id });
      //TODO worker tests
      //return Fixtures.getAdminUrl(server, `/dashboard/rooms/${createdRoom.room_id}`);
      //}).then((res) => {

      //expect(res.statusCode).to.equal(200);
      //return res.result;
      //}).then((result) => {

      //const $ = Cheerio.load(result);
      //const roomInfo = $('td').map(function () {

      //return $(this).text().trim();
      //}).get();
      //expect(roomInfo).to.include(createdRoom.room_id); // Resource
      //expect(roomInfo).to.include(Crypto.createHash('sha1').update(createdRoom.name).digest('base64')); // Name
      //expect(roomInfo).to.include('room_created');
      //return db.rooms.destroy({ id: createdRoom.room_id });
      //});
    });
  });

  describe('room_destroyed', () => {

    it('logs properly in dashboard', async () => {

      const createPayload = {
        eventType: 'room_created',
        data: destroyedRoom
      };
      const headers = {
        authorization: Fixtures.prosodyBasicHeader('testUser')
      };
      const destroyPayload = {
        eventType: 'room_destroyed',
        data: destroyedRoom
      };

      let res = await server.inject({ method: 'POST', url: '/prosody/telemetry', payload: createPayload, headers });
      expect(res.statusCode).to.equal(200);
      let event = await promisify(redis.lindex)('events', 0);
      expect(event).to.exist();
      event = JSON.parse(event);
      expect(event).to.include({ type: 'room_created', room_id: destroyedRoom.room_id });

      res = await server.inject({ method: 'POST', url: '/prosody/telemetry', payload: destroyPayload, headers });
      expect(res.statusCode).to.equal(200);
      event = await promisify(redis.lindex)('events', 1);
      expect(event).to.exist();
      event = JSON.parse(event);
      expect(event).to.include({ type: 'room_destroyed', room_id: destroyedRoom.room_id });
      //TODO worker tests
      //return Fixtures.getAdminUrl(server, `/dashboard/rooms/${destroyedRoom.room_id}`);
      //}).then((res) => {

      //expect(res.statusCode).to.equal(200);
      //return res.result;
      //}).then((result) => {

      //const $ = Cheerio.load(result);
      //const roomInfo = $('td').map(function () {

      //return $(this).text().trim();
      //}).get();
      //expect(roomInfo).to.include(destroyedRoom.room_id); // Resource
      //expect(roomInfo).to.include(Crypto.createHash('sha1').update(destroyedRoom.name).digest('base64')); // Name
      //expect(roomInfo).to.include('room_destroyed'); // Destroy event
      ////TODO it should update ended_at but where is that reflected in the dashboard?
      //return db.rooms.destroy({ id: destroyedRoom.room_id });
    });
  });

  describe('message_sent', () => {

    it('adds an event', async () => {

      const payload = {
        eventType: 'message_sent',
        data: {
          session_id: session.id
        }
      };
      const headers = {
        authorization: Fixtures.prosodyBasicHeader('testUser')
      };

      const res = await server.inject({ method: 'POST', url: '/prosody/telemetry', payload, headers });
      expect(res.statusCode).to.equal(200);
      let event = await promisify(redis.lindex)('events', 0);
      expect(event).to.exist();
      event = JSON.parse(event);
      expect(event).to.include({ type: 'message_sent', actor_id: session.id });
      //return Fixtures.getAdminUrl(server, `/dashboard/sessions/${session.id}`);
      //}).then((res) => {

      //expect(res.statusCode).to.equal(200);
      //return res.result;
      //}).then((result) => {

      //const $ = Cheerio.load(result);
      //const userInfo = $('td').map(function () {

      //return $(this).text().trim();
      //}).get();
      //expect(userInfo).to.include(session.id);
      //expect(userInfo).to.include(session.user_id);
      //expect(userInfo).to.include('message_sent');
      //});
    });
  });


  describe('user_online', () => {

    it('adds an event', async () => {

      const payload = {
        eventType: 'user_online',
        data: {
          session_id: session.id
        }
      };
      const headers = {
        authorization: Fixtures.prosodyBasicHeader('testUser')
      };

      const res = await server.inject({ method: 'POST', url: '/prosody/telemetry', payload, headers });
      expect(res.statusCode).to.equal(200);
      let event = await promisify(redis.lindex)('events', 0);
      expect(event).to.exist();
      event = JSON.parse(event);
      expect(event).to.include({ type: 'user_online', actor_id: session.id });
      //return Fixtures.getAdminUrl(server, `/dashboard/sessions/${session.id}`);
      //}).then((res) => {

      //expect(res.statusCode).to.equal(200);
      //return res.result;
      //}).then((result) => {

      //const $ = Cheerio.load(result);
      //const userInfo = $('td').map(function () {

      //return $(this).text().trim();
      //}).get();
      //expect(userInfo).to.include(session.id);
      //expect(userInfo).to.include(session.user_id);
      ////TODO it should update ended_at but where is that reflected in the dashboard?
      //expect(userInfo).to.include('user_online');
      //});
    });
  });

  describe('user_offline', () => {

    it('adds an event', async () => {

      const payload = {
        eventType: 'user_offline',
        data: {
          session_id: session.id
        }
      };
      const headers = {
        authorization: Fixtures.prosodyBasicHeader('testUser')
      };

      const res = await server.inject({ method: 'POST', url: '/prosody/telemetry', payload, headers });
      expect(res.statusCode).to.equal(200);
      let event = await promisify(redis.lindex)('events', 0);
      expect(event).to.exist();
      event = JSON.parse(event);
      expect(event).to.include({ type: 'user_offline', actor_id: session.id });
      //return Fixtures.getAdminUrl(server, `/dashboard/sessions/${session.id}`);
      //}).then((res) => {

      //expect(res.statusCode).to.equal(200);
      //return res.result;
      //}).then((result) => {

      //const $ = Cheerio.load(result);
      //const userInfo = $('td').map(function () {

      //return $(this).text().trim();
      //}).get();
      //expect(userInfo).to.include(session.id);
      //expect(userInfo).to.include(session.user_id);
      ////TODO it should update ended_at but where is that reflected in the dashboard?
      //expect(userInfo).to.include('user_offline');
      //});
    });
  });
});
