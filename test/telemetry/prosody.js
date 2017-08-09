'use strict';

const Lab = require('lab');
const Code = require('code');
const Fixtures = require('../fixtures');
const { db, Server } = Fixtures;
const cheerio = require('cheerio');
const Crypto = require('crypto');

const lab = exports.lab = Lab.script();

const { describe, it, before, after, afterEach } = lab
const { expect } = Code;

describe('POST /prosody/telemetry', () => {

  let server;
  const user = Fixtures.user();

  before(async() => {

    server = await Server;
    await db.users.insert(user);
  });

  after(async() => {

    await db.users.destroy({ id: user.id });
  });

  describe('room_created', () => {

    it('creates room that exists in dashboard', () => {
      const newRoom = Fixtures.room();
      const payload = {
        eventType: 'room_created',
        data: newRoom
      };
      const headers = {
        authorization: Fixtures.prosodyAuthHeader('testUser')
      };

      return server.inject({ method: 'POST', url: '/prosody/telemetry', payload, headers })
        .then((res) => {

          expect(res.statusCode).to.equal(200);
          return server.inject({ method: 'GET', url: `/dashboard/rooms/${newRoom.id}`})
        }).then((res) => {

          expect(res.statusCode).to.equal(200);
          return res.result;
        }).then((result) => {

          const $ = cheerio.load(result);
          const roomInfo = $('td').map(function() {
            return $(this).text().trim()
          }).get();
          expect(roomInfo).to.include(newRoom.id) // Resource
          expect(roomInfo).to.include(Crypto.createHash('sha1').update(newRoom.name).digest('base64')) // Name
          expect(roomInfo).to.include('room_created');
          return db.rooms.destroy({ id: newRoom.id });
        });
    });
  });

  describe('room_destroyed', () => {

    it('logs properly in dashboard', () => {

      const newRoom = Fixtures.room();
      const createPayload = {
        eventType: 'room_created',
        data: newRoom
      };
      const headers = {
        authorization: Fixtures.prosodyAuthHeader('testUser')
      };
      const destroyPayload = {
        eventType: 'room_destroyed',
        data: newRoom
      };

      return server.inject({ method: 'POST', url: '/prosody/telemetry', payload: createPayload, headers })
        .then((res) => {

          expect(res.statusCode).to.equal(200);
          return server.inject({ method: 'POST', url: '/prosody/telemetry', payload: destroyPayload, headers })
        }).then((res) => {

          expect(res.statusCode).to.equal(200);
          return server.inject({ method: 'GET', url: `/dashboard/rooms/${newRoom.id}`})
        }).then((res) => {

          expect(res.statusCode).to.equal(200);
          return res.result;
        }).then((result) => {

          const $ = cheerio.load(result);
          const roomInfo = $('td').map(function() {
            return $(this).text().trim()
          }).get();
          expect(roomInfo).to.include(newRoom.id) // Resource
          expect(roomInfo).to.include(Crypto.createHash('sha1').update(newRoom.name).digest('base64')) // Name
          expect(roomInfo).to.include('room_created');
          expect(roomInfo).to.include('room_destroyed') // Destroy event
          //TODO it should update ended_at but where is that reflected in the dashboard?
          return db.rooms.destroy({ id: newRoom.id });
        });
    });
  });

  describe('message_sent', () => {

    it('adds an event', () => {

      const payload = {
        eventType: 'message_sent',
        data: {
          user_id: user.id
        }
      }
      const headers = {
        authorization: Fixtures.prosodyAuthHeader('testUser')
      };

      return server.inject({ method: 'POST', url: '/prosody/telemetry', payload, headers })
        .then((res) => {

          expect(res.statusCode).to.equal(200);
          return server.inject({ method: 'GET', url: `/dashboard/users/${user.id}`})
        }).then((res) => {

          expect(res.statusCode).to.equal(200);
          return res.result;
        }).then((result) => {

          const $ = cheerio.load(result);
          const userInfo = $('td').map(function() {
            return $(this).text().trim()
          }).get();
          expect(userInfo).to.include(user.id)
          expect(userInfo).to.include(user.jid)
          expect(userInfo).to.include('message_sent');
        });
    });
  });


  describe('user_online', () => {

    it('adds an event', () => {

      const payload = {
        eventType: 'user_online',
        data: {
          user_id: user.id
        }
      }
      const headers = {
        authorization: Fixtures.prosodyAuthHeader('testUser')
      };

      return server.inject({ method: 'POST', url: '/prosody/telemetry', payload, headers })
        .then((res) => {

          expect(res.statusCode).to.equal(200);
          return server.inject({ method: 'GET', url: `/dashboard/users/${user.id}`})
        }).then((res) => {

          expect(res.statusCode).to.equal(200);
          return res.result;
        }).then((result) => {

          const $ = cheerio.load(result);
          const userInfo = $('td').map(function() {
            return $(this).text().trim()
          }).get();
          expect(userInfo).to.include(user.id)
          expect(userInfo).to.include(user.jid)
          //TODO it should update ended_at but where is that reflected in the dashboard?
          expect(userInfo).to.include('user_online');
        });
    });
  });
  describe('user_offline', () => {

    it('adds an event', () => {

      const payload = {
        eventType: 'user_offline',
        data: {
          user_id: user.id
        }
      }
      const headers = {
        authorization: Fixtures.prosodyAuthHeader('testUser')
      };

      return server.inject({ method: 'POST', url: '/prosody/telemetry', payload, headers })
        .then((res) => {

          expect(res.statusCode).to.equal(200);
          return server.inject({ method: 'GET', url: `/dashboard/users/${user.id}`})
        }).then((res) => {

          expect(res.statusCode).to.equal(200);
          return res.result;
        }).then((result) => {

          const $ = cheerio.load(result);
          const userInfo = $('td').map(function() {
            return $(this).text().trim()
          }).get();
          expect(userInfo).to.include(user.id)
          expect(userInfo).to.include(user.jid)
          //TODO it should update ended_at but where is that reflected in the dashboard?
          expect(userInfo).to.include('user_offline');
        });
    });
  });
});
