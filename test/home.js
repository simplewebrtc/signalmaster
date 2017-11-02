'use strict';

const Lab = require('lab');
const Code = require('code');
const Fixtures = require('./fixtures');
const { Server } = Fixtures;

const lab = exports.lab = Lab.script();

const { describe, it, before } = lab;
const { expect } = Code;

describe('GET /', () => {

  let server;

  before(async () => {

    server = await Server;
  });

  it('works', () => {

    return server.inject({ method: 'GET', url: '/' })
      .then((res) => {

        console.log(res.result);
        expect(res.statusCode).to.equal(200);
      });
  });
});
