'use strict';

const Lab = require('lab');
const Code = require('code');
const Fixtures = require('../fixtures');
const { Server } = Fixtures;

const lab = exports.lab = Lab.script();

const { describe, it, before } = lab;
const { expect } = Code;

describe('GET /prosody/ice-servers', () => {

  let server;

  before(async () => {

    server = await Server;
  });

  it('requires auth', () => {

    return server.inject({ method: 'POST', url: '/prosody/ice-servers' })
      .then((res) => {

        expect(res.statusCode).to.equal(401);
      });
  });

  it('works', () => {

    const session = Fixtures.session();
    return server.inject({ method: 'POST', url: '/prosody/ice-servers', credentials: session })
      .then((res) => {

        expect(res.statusCode).to.equal(200);
      });
  });

  it('auth', () => {

    const headers = {
      authorization: Fixtures.prosodyBasicHeader('testUser')
    };

    return server.inject({ method: 'POST', url: '/prosody/ice-servers', headers })
      .then((res) => {

        expect(res.statusCode).to.equal(200);
      });
  });
});
