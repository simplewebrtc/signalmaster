const Lab = require('lab');
const JWT = require('jsonwebtoken');
const Config = require('getconfig')
const { db, createRoom, setupUser, createProsodyAuthHeader } = require('./utils');
const Server = require('../server');
const license = require('../lib/licensing');
const Base32 = require('base32-crockford-browser');

const lab = exports.lab = Lab.script();

const { describe, it, before, after, afterEach } = lab
const { expect } = Lab;

describe('Rooms Affiliation', () => {
  let server, user, room;
  const createRoomInfo = { roomId: 'randomRoomId', name: 'test-room', jid: `test-room@talky.io.tests` }

  before(() => {
    return Server.then((s) => {
      server = s
      return createRoom(server, createRoomInfo)
    })
    .then((r) => (room = r))
  });

  after(() => {
    return db.rooms.destroy({ roomid: createRoomInfo.roomId })
  })

  it('Should return `guest` for a guest account', () => {
    let guestUser
    return setupUser(server, 'guest')
    .then((u) => {
      guestUser = u;
      return server.inject({
        method: 'POST', 
        url: '/prosody/rooms/user-info',
        payload: { roomId: room.roomid, userId: guestUser.userId, sessionId: guestUser.sessionId },
        headers: { authorization: createProsodyAuthHeader('newUser') } 
      })
    })
    .then((res) => {
      expect(res.statusCode).to.equal(200);
      expect(res.result).to.equal({ customerData: { id: 'anon' }, sessionId: guestUser.sessionId, userType: 'guest' })
      return db.users.destroy({ sessionid: guestUser.sessionId })
    })
  })

  it('Should return `bot` for a bot account', () => {
    let botUser;
    return setupUser(server, 'bot')
    .then((u) => {
      botUser = u;
      return server.inject({
        method: 'POST', 
        url: '/prosody/rooms/user-info',
        payload: { roomId: room.roomid, userId: botUser.userId, sessionId:  botUser.sessionId},
        headers: { authorization: createProsodyAuthHeader('newUser') } 
      })
    })
    .then((res) => {
      expect(res.statusCode).to.equal(200);
      expect(res.result).to.equal({ sessionId: botUser.sessionId, userType: 'bot' })
      return db.users.destroy({ sessionid: botUser.sessionId })
    })
  })

  it('Should return `bot` for a bot account', () => {
    let user;
    return setupUser(server, 'user')
    .then((u) => {
      user = u
      return server.inject({
        method: 'POST', 
        url: '/prosody/rooms/user-info',
        payload: { roomId: room.roomid, userId: user.userId, sessionId:  user.sessionId},
        headers: { authorization: createProsodyAuthHeader('newUser') } 
      })
    })
    .then((res) => {
      expect(res.statusCode).to.equal(200);
      expect(res.result.userType).to.equal('registered')
      return db.users.destroy({ sessionid: user.sessionId })
    })
  })

});
