'use strict';

const Lab = require('lab');
const Code = require('code');
const Fixtures = require('../fixtures');
const { db, Server } = Fixtures;
const Nock = require('nock');
const Config = require('getconfig');

const lab = exports.lab = Lab.script();

const { describe, it, before, after, afterEach } = lab
const { expect } = Code;

describe('POST /config/guest', () => {
  let server;

  before(async() => {

    server = await Server;
  });

  it('Should return proper data for guest route and log it', () => {

    const iceServers = Fixtures.iceServers();
    Nock(Config.talky.ice.servers[0])
    .get('/ice-servers.json')
    .reply(200, iceServers);

    let jid;

    return server.inject({ method: 'POST', url: '/config/guest', payload: {} })
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        return res.result;
      }).then((result) => {

        const id = result.id;
        jid = result.jid;
        expect(result.iceServers).to.part.include(iceServers);
        expect(result.iceServers[0]).to.include(['username', 'password']);
        return server.inject({ method: 'GET', url: `/dashboard/users/${id}` });
      }).then((res) => {

        expect(res.statusCode).to.equal(200);
        return db.users.destroy({ userid: jid });
      });
  })
});
