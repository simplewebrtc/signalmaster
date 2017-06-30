const Lab = require('lab');
const JWT = require('jsonwebtoken');
const Config = require('getconfig')
const { db } = require('./utils');
const Server = require('../server');
const license = require('../lib/licensing');
const Base32 = require('base32-crockford-browser');

const lab = exports.lab = Lab.script();

const { describe, it, before, after, afterEach } = lab
const { expect } = Lab;

const hasAllConfigProperties = (res, displayName = true) => {
  expect(res.result.sessionId).to.not.be.undefined()
  expect(res.result.userId).to.not.be.undefined()
  expect(res.result.signalingUrl).to.not.be.undefined()
  expect(res.result.telemetryUrl).to.not.be.undefined()
  expect(res.result.roomServer).to.not.be.undefined()
  expect(res.result.iceServers).to.not.be.undefined()
  expect(res.result.credential).to.not.be.undefined()
  if (displayName) expect(res.result.displayName).to.not.be.undefined()
}

describe('Config', () => {
  let server;
  const user = {
    id: 4,
    scopes: ['mod']
  }
  let token = JWT.sign(user, Config.talky.apiKey, {
        algorithm: 'HS256',
        expiresIn: '1 day'
      })

  before(() => {
    return Server.then((s) => {
      return server = s
    })
  });

  it('Should return proper data for guest route', () => {
    return server.inject({ method: 'POST', url: '/config/guest', payload: {} })
    .then((res) => {
      expect(res.statusCode).to.equal(200);
      hasAllConfigProperties(res)
      db.users.destroy({ userid: res.result.userId }) 
    })
  })

  it('Should return proper data for bot route', () => {
    return server.inject({ method: 'POST', url: '/config/bot', payload: {} })
    .then((res) => {
      expect(res.statusCode).to.equal(200);
      hasAllConfigProperties(res, false)
      db.users.destroy({ userid: res.result.userId }) 
    })
  })

  it('Should return proper data for user route', () => {
    return server.inject({ method: 'POST', url: '/config/user', payload: { token } })
    .then((res) => {
      const decodedUserId = JSON.parse(Base32.decode(res.result.userId.split('@')[0]))
      expect(decodedUserId.id).to.equal(user.id)
      expect(decodedUserId.scopes).to.equal(user.scopes)
      expect(res.statusCode).to.equal(200);
      hasAllConfigProperties(res)
      db.users.destroy({ userid: res.result.userId })
    })
  })

});
