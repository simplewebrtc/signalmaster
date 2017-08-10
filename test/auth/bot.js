'use strict';

const Lab = require('lab');
const Code = require('code');
const Fixtures = require('../fixtures');
const { Server } = Fixtures;

const lab = exports.lab = Lab.script();

const { describe, it, before } = lab;
const { expect } = Code;

describe('GET /prosody/auth/bot', () => {

  let server;

  before(async () => {

    server = await Server;
  });

  it('requires auth', () => {

    return server.inject({ method: 'GET', url: '/prosody/auth/bot' })
      .then((res) => {

        expect(res.statusCode).to.equal(401);
      });
  });

  it('works', () => {

    const headers = {
      authorization: Fixtures.prosodyTokenHeader({ id: 'testUser' }, 'bots')
    };

    return server.inject({ method: 'GET', url: '/prosody/auth/bot', headers })
      .then((res) => {

        expect(res.statusCode).to.equal(200);
        expect(res.result).to.equal('true');
      });
  });

  it('invalid auth', () => {

    const headers = {
      authorization: Fixtures.prosodyBasicHeader('testUser')
    };

    return server.inject({ method: 'GET', url: '/prosody/auth/bot', headers })
      .then((res) => {

        expect(res.statusCode).to.equal(401);
      });
  });
});
