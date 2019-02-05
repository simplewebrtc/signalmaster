'use strict';

const Lab = require('lab');
const Code = require('code');
const Fixtures = require('./fixtures');
const { Server } = Fixtures;

const lab = exports.lab = Lab.script();

const { describe, it, before } = lab;
const { expect } = Code;

describe('GET /ice', () => {

  let server;

  before(async () => {

    server = await Server;
  });

  it('requires auth', () => {

    return server.inject({ method: 'GET', url: '/ice' })
      .then((res) => {

        expect(res.statusCode).to.equal(401);
      });
  });

  it('works', () => {

    const session = Fixtures.session();
    return server.inject({ method: 'GET', url: '/ice', auth: { credentials: session, strategy: 'client-token' } })
      .then((res) => {

        expect(res.statusCode).to.equal(200);
      });
  });

  it('auth', () => {

    const headers = {
      authorization: Fixtures.clientToken(Fixtures.session())
    };

    return server.inject({ method: 'GET', url: '/ice', headers })
      .then((res) => {

        expect(res.statusCode).to.equal(200);
      });
  });
});
