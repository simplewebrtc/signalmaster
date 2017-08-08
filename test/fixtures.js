'use strict';

const Server = require('../server');
const Faker = require('faker');
const JWT = require('jsonwebtoken');
const Config = require('getconfig');
const Crypto = require('crypto');

exports.Server = Server.Server;
exports.db = Server.db;

exports.iceServers = function () {

  const result = [{
    type: 'turn',
    host: '10.0.0.42'
  }];

  return result;
};

exports.user = function (attrs) {

  const defaults = {
    id: Faker.random.number(),
    scopes: ['mod']
  };

  return Object.assign(defaults, attrs);
};

exports.token = function (unsigned, attrs) {

  const defaults = {
    algorithm: 'HS256',
    expiresIn: '1 day'
  };

  const tokenAttrs = Object.assign(defaults, attrs);

  return JWT.sign(unsigned, Config.talky.apiKey, tokenAttrs);
};

exports.room = function (attrs) {

  const defaults = {
    roomid: Faker.lorem.word(),
    name: Faker.lorem.words().split(' ').join('-'),
    jid: Faker.internet.email()
  };

  return Object.assign(defaults, attrs);
};

exports.prosodyAuthHeader = function (username) {
  const password = Crypto.createHmac('sha1', Buffer.from(Config.auth.secret)).update(username).digest('base64')
  const header =  `Basic ${new Buffer(username + ':' + password, 'utf8').toString('base64')}`;
  return header;
};
