'use strict';

const Lab = require('lab');
const Code = require('code');
const Fixtures = require('../fixtures');
const { db, Server } = Fixtures;
const Nock = require('nock');
const Config = require('getconfig');
const Base32 = require('base32-crockford-browser');

const lab = exports.lab = Lab.script();

const { describe, it, before, after, afterEach } = lab
const { expect } = Code;

describe('Bot account', () => {

  let server;

  before(async() => {

    server = await Server;
  });

  it('created and exists', () => {

    let botUser;
    const iceServers = Fixtures.iceServers();
    const newRoom = Fixtures.room();

    Nock(Config.talky.ice.servers[0])
      .get('/ice-servers.json')
      .reply(200, iceServers);

    return server.inject({ method: 'POST', url: '/config/bot', payload: {} })
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        return res.result;
      }).then((result) => {

        botUser = result;
        const id = botUser.id;
        expect(botUser.iceServers).to.part.include(iceServers);
        expect(botUser.iceServers[0]).to.include(['username', 'password']);
        return server.inject({ method: 'GET', url: `/dashboard/users/${botUser.id}` });
      }).then((res) => {

        expect(res.statusCode).to.equal(404);

        const newRoom = Fixtures.room();
        const payload = {
          room_id: newRoom.id,
          jid: botUser.jid,
          user_id: botUser.id
        };
        const headers = {
          authorization: Fixtures.prosodyAuthHeader('testUser')
        };

        return server.inject({ method: 'POST', url: '/prosody/rooms/user-info', payload, headers })
      }).then((res) => {

        expect(res.statusCode).to.equal(200);
        return res.result;
      }).then((result) => {

        expect(result).to.include({ userType: 'bot', id: botUser.id });
        return db.users.destroy({ id: botUser.id });
      });
    return db.users.destroy({ id: botUser.id });
  });
});
