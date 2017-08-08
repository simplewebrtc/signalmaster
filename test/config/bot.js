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

describe('POST /config/bot', () => {

  let server;

  before(async() => {

    server = await Server;
  });

  it('Should return proper data for bot route and log it ', () => {

    const iceServers = Fixtures.iceServers();
    Nock(Config.talky.ice.servers[0])
    .get('/ice-servers.json')
    .reply(200, iceServers);

    let userId;

    return server.inject({ method: 'POST', url: '/config/bot', payload: {} })
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        return res.result;
      }).then((result) => {

        const sessionId = result.sessionId;
        userId = result.userId;
        expect(result.iceServers).to.part.include(iceServers);
        expect(result.iceServers[0]).to.include(['username', 'password']);
        return server.inject({ method: 'GET', url: `/dashboard/users/${sessionId}` });
      }).then((res) => {

        expect(res.statusCode).to.equal(404);
        return db.users.destroy({ userid: userId });
      });
  })
});
