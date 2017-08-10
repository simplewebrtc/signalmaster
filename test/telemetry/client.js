'use strict';

const Lab = require('lab');
const Code = require('code');
const Fixtures = require('../fixtures');
const { db, Server } = Fixtures;
const Cheerio = require('cheerio');
const Crypto = require('crypto');

const lab = exports.lab = Lab.script();

const { describe, it, before, after } = lab;
const { expect } = Code;

describe('POST /telemetry', () => {

  let server;
  const session = Fixtures.session();

  before(async () => {

    server = await Server;
    await db.sessions.insert(session);
  });

  after(async () => {

    await db.sessions.destroy({ id: session.id });
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
    newRoom.room_id = newRoom.id;
    delete newRoom.id;
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
          roomId: newRoom.room_id
        };
        return server.inject({ method: 'POST', url: '/telemetry', payload: clientPayload, credentials: session });
      }).then((res) => {

        expect(res.statusCode).to.equal(200);
        return server.inject({ method: 'GET', url: `/dashboard/rooms/${newRoom.room_id}` });
      }).then((res) => {

        expect(res.statusCode).to.equal(200);
        return res.result;
      }).then((result) => {

        const $ = Cheerio.load(result);
        const roomInfo = $('td').map(function () {

          return $(this).text().trim();
        }).get();
        expect(roomInfo).to.include(newRoom.room_id); // Resource
        expect(roomInfo).to.include(Crypto.createHash('sha1').update(newRoom.name).digest('base64')); // Name
        expect(roomInfo).to.include('video_paused');
        return db.rooms.destroy({ id: newRoom.room_id });
      });

  });
});
