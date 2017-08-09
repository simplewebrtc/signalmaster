'use strict';

const Lab = require('lab');
const Code = require('code');
const Fixtures = require('./fixtures');
const { Server } = Fixtures;

const lab = exports.lab = Lab.script();

const { describe, it, before } = lab;
const { expect } = Code;

describe('GET /ice-servers', () => {

  let server;

  before(async () => {

    server = await Server;
  });

  it('requires auth', () => {

    return server.inject({ method: 'GET', url: '/ice-servers' })
      .then((res) => {

        expect(res.statusCode).to.equal(401);
      });
  });

  it('works', () => {

    const user = Fixtures.user();
    return server.inject({ method: 'GET', url: '/ice-servers', credentials: user })
      .then((res) => {

        expect(res.statusCode).to.equal(200);
      });
  });
});
