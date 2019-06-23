'use strict';

const Lab = require('@hapi/lab');
const Code = require('code');
const Fixtures = require('../fixtures');
const { Server } = Fixtures;

const lab = exports.lab = Lab.script();

const { describe, it, before } = lab;
const { expect } = Code;

describe('POST /config/room', () => {

  let server;

  before(async () => {

    server = await Server;
  });

  it('requires auth', () => {

    return server.inject({ method: 'POST', url: '/config/room' })
      .then((res) => {

        expect(res.statusCode).to.equal(401);
      });
  });

  it('works', () => {

    const headers = {
      authorization: Fixtures.clientToken(Fixtures.session({
        orgId: 'testing'
      }))
    };
    const payload = {
      name: 'FOO'
    };

    return server.inject({ method: 'POST', url: '/config/room', headers, payload })
      .then((res) => {

        expect(res.statusCode).to.equal(200);
        expect(res.result.roomAddress).to.equal('testing#foo@rooms.localhost');
      });
  });
});
