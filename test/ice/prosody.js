'use strict';

const Lab = require('lab');
const Code = require('code');
const Fixtures = require('../fixtures');
const { Server } = Fixtures;

const lab = exports.lab = Lab.script();

const { describe, it, before } = lab;
const { expect } = Code;

describe('GET /prosody/ice', () => {

  let server;

  before(async () => {

    server = await Server;
  });

  it('requires auth', () => {

    return server.inject({ method: 'POST', url: '/prosody/ice' })
      .then((res) => {

        expect(res.statusCode).to.equal(401);
      });
  });

  it('works', () => {

    const session = Fixtures.session();
    const payload = {
      user_id: session.user_id,
      session_id: session.id
    };
    return server.inject({ method: 'POST', url: '/prosody/ice', credentials: session, payload })
      .then((res) => {

        expect(res.statusCode).to.equal(200);
      });
  });

  it('auth', () => {

    const session = Fixtures.session();
    const headers = {
      authorization: Fixtures.prosodyBasicHeader('testUser')
    };
    const payload = {
      user_id: session.user_id,
      session_id: session.id
    };
    return server.inject({ method: 'POST', url: '/prosody/ice', headers, payload })
      .then((res) => {

        expect(res.statusCode).to.equal(200);
      });
  });
});
