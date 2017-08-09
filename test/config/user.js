'use strict';

const Lab = require('lab');
const Code = require('code');
const Fixtures = require('../fixtures');
const { db, Server } = Fixtures;
const Nock = require('nock');
const Config = require('getconfig');
const Base32 = require('base32-crockford-browser');

const lab = exports.lab = Lab.script();

const { describe, it, before } = lab;
const { expect } = Code;

describe('POST /config/user', () => {

  let server;

  before(async () => {

    server = await Server;
  });

  it('Should return proper data for user route and log it ', () => {

    const iceServers = Fixtures.iceServers();
    const session = Fixtures.session();
    const token = Fixtures.token(session);

    Nock(Config.talky.ice.servers[0])
      .get('/ice-servers.json')
      .reply(200, iceServers);

    let registeredUser;

    return server.inject({ method: 'POST', url: '/config/user', payload: { token } })
      .then((res) => {

        expect(res.statusCode).to.equal(200);
        return res.result;
      }).then((result) => {

        registeredUser = result;
        const user_id = registeredUser.userId;
        const decodedJid = JSON.parse(Base32.decode(user_id.split('@')[0]));

        expect(registeredUser.iceServers).to.part.include(iceServers);
        expect(registeredUser.iceServers).to.part.include(iceServers);
        expect(registeredUser.iceServers[0]).to.include(['username', 'password']);
        expect(decodedJid.id).to.equal(session.id);
        expect(decodedJid.scopes).to.equal(session.scopes);
        return server.inject({ method: 'GET', url: `/dashboard/sessions/${registeredUser.id}` });
      }).then((res) => {

        expect(res.statusCode).to.equal(200);

        const newRoom = Fixtures.room();
        const payload = {
          room_id: newRoom.id,
          user_id: registeredUser.userId,
          session_id: registeredUser.id
        };
        const headers = {
          authorization: Fixtures.prosodyAuthHeader('testUser')
        };

        return server.inject({ method: 'POST', url: '/prosody/rooms/user-info', payload, headers });
      }).then((res) => {

        expect(res.statusCode).to.equal(200);
        return res.result;
      }).then((result) => {

        expect(result).to.include({ userType: 'registered', id: registeredUser.id });
        return db.sessions.destroy({ id: registeredUser.id });
      });
  });
});
