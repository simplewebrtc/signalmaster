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

  before(async () => {

    server = await Server;
    await db.sessions.insert(session);
  });

  afterEach(async () => {

    await promisify(redis.del)('events');
  });

  after(async () => {

    await db.sessions.destroy({ id: session.id });
  });

  describe('room_created', () => {

    it('creates room that exists in dashboard', async () => {

      const newRoom = Fixtures.room();
      newRoom.room_id = newRoom.id;
      delete newRoom.id;
      const payload = {
        eventType: 'room_created',
        data: newRoom
      };
      const headers = {
        authorization: Fixtures.prosodyBasicHeader('testUser')
      };

      const res = await server.inject({ method: 'POST', url: '/prosody/telemetry', payload, headers });
      expect(res.statusCode).to.equal(200);
      let event = await promisify(redis.lindex)('events', 0);
      expect(event).to.exist();
      event = JSON.parse(event);
      expect(event).to.include({ type: 'room_created', room_id: newRoom.room_id });
      //TODO worker tests
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
      //expect(roomInfo).to.include('room_created');
      //return db.rooms.destroy({ id: newRoom.room_id });
      //});
    });
  });

  describe('room_destroyed', () => {

    it('logs properly in dashboard', async () => {

      const newRoom = Fixtures.room();
      newRoom.room_id = newRoom.id;
      delete newRoom.id;

      const createPayload = {
        eventType: 'room_created',
        data: newRoom
      };
      const headers = {
        authorization: Fixtures.prosodyBasicHeader('testUser')
      };
      const destroyPayload = {
        eventType: 'room_destroyed',
        data: newRoom
      };

      let res = await server.inject({ method: 'POST', url: '/prosody/telemetry', payload: createPayload, headers });
      expect(res.statusCode).to.equal(200);
      let event = await promisify(redis.lindex)('events', 0);
      expect(event).to.exist();
      event = JSON.parse(event);
      expect(event).to.include({ type: 'room_created', room_id: newRoom.room_id });

      res = await server.inject({ method: 'POST', url: '/prosody/telemetry', payload: destroyPayload, headers });
      expect(res.statusCode).to.equal(200);
      event = await promisify(redis.lindex)('events', 1);
      expect(event).to.exist();
      event = JSON.parse(event);
      expect(event).to.include({ type: 'room_destroyed', room_id: newRoom.room_id });
      //TODO worker tests
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
      //expect(roomInfo).to.include('room_destroyed'); // Destroy event
      ////TODO it should update ended_at but where is that reflected in the dashboard?
      //return db.rooms.destroy({ id: newRoom.room_id });
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
