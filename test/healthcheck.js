'use strict';

const Lab = require('@hapi/lab');
const Code = require('code');
const Fixtures = require('./fixtures');
const { Server } = Fixtures;

const lab = exports.lab = Lab.script();

const { describe, it, before } = lab;
const { expect } = Code;

describe('GET /healthcheck', () => {

  let server;

  before(async () => {

    server = await Server;
  });

  it('works', () => {

    return server.inject({ method: 'GET', url: '/healthcheck' })
      .then((res) => {

        expect(res.statusCode).to.equal(200);
      });
  });
});
