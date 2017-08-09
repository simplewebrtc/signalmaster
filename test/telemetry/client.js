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

describe('POST /telemetry', () => {

  let server;
  const user = Fixtures.user();

  before(async() => {

    server = await Server;
    await db.users.insert(user);
  });

  after(async() => {

    await db.users.destroy({ id: user.id });
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

    const newRoom = Fixtures.room();
    const prosodyPayload = {
      eventType: 'room_created',
      data: newRoom
    };
    const headers = {
      authorization: Fixtures.prosodyAuthHeader('testUser')
    };

    return server.inject({ method: 'POST', url: '/prosody/telemetry', payload: prosodyPayload, headers })
      .then((res) => {

        expect(res.statusCode).to.equal(200);
        const clientPayload = {
          eventType: 'video_paused',
          data: {
            id: newRoom.id
          }
        };
        return server.inject({ method: 'POST', url: '/telemetry', payload: clientPayload, credentials: user })
      }).then((res) => {

        expect(res.statusCode).to.equal(200);
        return server.inject({ method: 'GET', url: `/dashboard/rooms/${newRoom.id}` });
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
        expect(roomInfo).to.include('video_paused');
        return db.rooms.destroy({ id: newRoom.id });
      });

  });
});
