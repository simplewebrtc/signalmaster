'use strict';

const Lab = require('lab');
const Code = require('code');
const Fixtures = require('../fixtures');
const { db, Server } = Fixtures;

const lab = exports.lab = Lab.script();

const { describe, it, before, after } = lab;
const { expect } = Code;

describe('POST /prosody/rooms/affiliation', () => {

  let server;
  const user = Fixtures.user();

  before(async () => {

    server = await Server;
    await db.users.insert(user);
  });

  after(async () => {

    await db.users.destroy({ id: user.id });
  });

  it('returns "owner"', () => {

    const newRoom = Fixtures.room();
    const createPayload = {
      eventType: 'room_created',
      data: newRoom
    };
    const headers = {
      authorization: Fixtures.prosodyAuthHeader('testUser')
    };

    return server.inject({ method: 'POST', url: '/prosody/telemetry', payload: createPayload, headers })
      .then((res) => {

        expect(res.statusCode).to.equal(200);

        const affiliationPayload = {
          id: newRoom.id,
          user_id: user.id
        };

        return server.inject({ method: 'post', url: '/prosody/rooms/affiliation', payload: affiliationPayload, headers });
      }).then((res) => {

        expect(res.statusCode).to.equal(200);
        return res.result;
      }).then((result) => {

        expect(result).to.equal('owner');
        return db.rooms.destroy({ id: newRoom.id });
      });
  });

  it('401', () => {

    const newRoom = Fixtures.room();
    const payload = {
      id: newRoom.id,
      user_id: user.id
    };
    return server.inject({ method: 'post', url: '/prosody/rooms/affiliation', payload })
      .then((res) => {

        expect(res.statusCode).to.equal(401);
      });
  });
});
