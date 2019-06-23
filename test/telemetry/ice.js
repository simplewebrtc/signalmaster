'use strict';

const Lab = require('@hapi/lab');
const Code = require('code');
const Fixtures = require('../fixtures');
const { Server } = Fixtures;

const lab = exports.lab = Lab.script();

const { describe, it, before }  = lab;
const { expect } = Code;


describe('POST /ice/usage', () => {

  let server;

  before(async () => {

    server = await Server;
  });


  it('unauthorized', () => {

    const payload = {
      server: 'ice-test',
      orgId: 'placeholder',
      sessionId: 'some-user',
      bytesSent: 0,
      bytesReceived: 0
    };
    return server.inject({ method: 'POST', url: '/ice/telemetry', payload })
      .then((res) => {

        expect(res.statusCode).to.equal(401);
      });
  });

  it('accepts payload', () => {

    const headers = {
      authorization: Fixtures.prosodyBasicHeader('testUser')
    };

    const payload = {
      server: 'ice-test',
      orgId: 'placeholder',
      sessionId: 'some-user',
      bytesSent: 0,
      bytesReceived: 0
    };

    return server.inject({ method: 'POST', url: '/ice/telemetry', payload, headers })
      .then((res) => {

        expect(res.statusCode).to.equal(200);
      });
  });
});
