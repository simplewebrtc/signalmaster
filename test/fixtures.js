'use strict';

const Server = require('../server');
const Faker = require('faker');
const JWT = require('jsonwebtoken');
const Config = require('getconfig');
const Crypto = require('crypto');
const InflateDomains = require('../lib/domains');
const Domains = InflateDomains(Config.talky.domains);

exports.Server = Server.Server;
exports.db = Server.db;
exports.redis = Server.redis;
exports.eventWorker = Server.eventWorker;
exports.roomReports = Server.roomReports;
exports.iceWorker = Server.iceWorker;

exports.iceServers = function () {

  const result = [{
    type: 'turn',
    host: 'ice-test.talky.io',
    port: 3478
  }, {
    type: 'turn',
    host: 'ice-test.talky.io',
    port: 3478,
    transport: 'tcp'
  }, {
    type: 'turns',
    host: 'ice-test.talky.io',
    port: 443,
    transport: 'tcp'
  }
  ];

  return result;
};

exports.event = function (attrs) {

  const now = new Date();
  const defaults = {
    created_at: now,
    updated_at: now,
    room_id: Faker.random.word()
  };

  if (Math.random() * 2 > 1) {
    defaults.actor_id = Faker.internet.email();
    if (Math.random() * 3 > 1) {
      defaults.peer_id = Faker.internet.email();
    }
  }
  return Object.assign(defaults, attrs);
};
exports.iceEvent = function (attrs) {

  const now = new Date();
  const defaults = {
    created_at: now,
    server: Faker.random.word(),
    org_id: Faker.random.word(),
    bytes_sent: Math.floor(Math.random() * 100),
    bytes_received: Math.floor(Math.random() * 100)
  };

  return Object.assign(defaults, attrs);
};
exports.session = function (attrs) {

  const defaults = {
    id: Faker.random.word(),
    user_id: Faker.internet.email(),
    scopes: ['mod']
  };

  return Object.assign(defaults, attrs);
};

exports.apiToken = function (unsigned, attrs) {

  const defaults = {
    algorithm: 'HS256',
    expiresIn: '1 day'
  };

  const tokenAttrs = Object.assign(defaults, attrs);

  return JWT.sign(unsigned, Config.talky.apiKey, tokenAttrs);
};

exports.clientToken = function (unsigned, attrs) {

  const defaults = {
    algorithm: 'HS256',
    expiresIn: '1 day',
    issuer: Domains.api
  };

  const tokenAttrs = Object.assign(defaults, attrs);

  return JWT.sign(unsigned, Config.auth.secret, tokenAttrs);
};

exports.room = function (attrs) {

  const defaults = {
    id: Faker.random.word(),
    name: Faker.lorem.words().split(' ').join('-'),
    jid: Faker.internet.email()
  };

  return Object.assign(defaults, attrs);
};

exports.adminBasicHeader = function (username) {

  const password = (Config.talky.admins || {})[username];
  const header = `Basic ${new Buffer(`${username}:${password}`, 'utf8').toString('base64')}`;
  return header;
};

exports.prosodyBasicHeader = function (username) {

  const password = Crypto.createHmac('sha1', Buffer.from(Config.auth.secret)).update(username).digest('base64');
  const header =  `Basic ${new Buffer(`${username}:${password}`, 'utf8').toString('base64')}`;
  return header;
};

exports.prosodyTokenHeader = function (unsigned, kind, attrs) {

  const defaults = {
    algorithm: 'HS256', expiresIn: '1 day',
    issuer: Domains.api,
    audience: Domains[kind],
    subject: unsigned.id
  };

  const tokenAttrs = Object.assign(defaults, attrs);

  const token = JWT.sign(unsigned, Config.auth.secret, tokenAttrs);

  const header =  `Basic ${new Buffer(`${unsigned.id}:${token}`, 'utf8').toString('base64')}`;
  return header;
};

exports.getAdminUrl = function (server, url) {

  return server.inject({
    method: 'GET',
    url,
    headers: {
      authorization: exports.adminBasicHeader('testAdmin')
    }
  });
};

