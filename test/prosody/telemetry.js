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

  before(async() => {

    server = await Server;
  });

  describe('room_created', () => {

    it('creates room that exists in dashboard', () => {
      const room = Fixtures.room();
      const payload = {
        eventType: 'room_created',
        data: room
      };
      const headers = {
        authorization: Fixtures.prosodyAuthHeader('testUser')
      };

      return server.inject({ method: 'POST', url: '/prosody/telemetry', payload, headers })
        .then((res) => {

          expect(res.statusCode).to.equal(200);
          return server.inject({ method: 'GET', url: `/dashboard/rooms/${room.roomid}`})
        }).then((res) => {

          expect(res.statusCode).to.equal(200);
          return res.result;
        }).then((result) => {

          const $ = cheerio.load(result);
          const roomInfo = $('td').map(function() {
            return $(this).text().trim()
          }).get();
          expect(roomInfo).to.include(room.roomid) // Resource
          expect(roomInfo).to.include(Crypto.createHash('sha1').update(room.name).digest('base64')) // Name
          expect(roomInfo).to.include('room_created') // Creation event
          return db.rooms.destroy({ roomid: room.roomid });
        });
    });
  });
});
