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

exports.iceServers = function () {

  const result = [{
    type: 'turn',
    host: '10.0.0.42'
  }, {
    type: 'turns',
    host: '10.0.0.43'
  }, {
    type: 'stun',
    host: '10.0.0.44'
  }];

  return result;
};

exports.session = function (attrs) {

  const defaults = {
    id: Faker.lorem.word(),
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
    id: Faker.lorem.word(),
    name: Faker.lorem.words().split(' ').join('-'),
    jid: Faker.internet.email()
  };

  return Object.assign(defaults, attrs);
};

exports.prosodyBasicHeader = function (username) {

  const password = Crypto.createHmac('sha1', Buffer.from(Config.auth.secret)).update(username).digest('base64');
  const header =  `Basic ${new Buffer(`${username  }:${  password}`, 'utf8').toString('base64')}`;
  return header;
};

exports.prosodyTokenHeader = function (unsigned, kind, attrs) {

  const defaults = {
    algorithm: 'HS256',
    expiresIn: '1 day',
    issuer: Domains.api,
    audience: Domains[kind],
    subject: unsigned.id
  };

  const tokenAttrs = Object.assign(defaults, attrs);

  const token = JWT.sign(unsigned, Config.auth.secret, tokenAttrs);

  const header =  `Basic ${new Buffer(`${unsigned.id}:${token}`, 'utf8').toString('base64')}`;
  return header;
};
