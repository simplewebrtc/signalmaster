'use strict';

const Lab = require('lab');
const Code = require('code');
const Fixtures = require('./fixtures');
const { Server } = Fixtures;

const lab = exports.lab = Lab.script();

const { describe, it, before } = lab;
const { expect } = Code;

describe('GET /.well-known/host-meta.json', () => {

  let server;

  before(async () => {

    server = await Server;
  });

  it('works', () => {

    return server.inject({ method: 'GET', url: '/.well-known/host-meta.json' })
      .then((res) => {

        expect(res.statusCode).to.equal(200);
      });
  });
});
