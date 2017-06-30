const Lab = require('lab');
const JWT = require('jsonwebtoken');
const Config = require('getconfig')
const Crypto = require('crypto')
const { db, setupUser, createRoom, createProsodyAuthHeader } = require('./utils');
const Server = require('../server');
const license = require('../lib/licensing');
const Base32 = require('base32-crockford-browser');

const lab = exports.lab = Lab.script();

const { describe, it, before, after, afterEach } = lab
const { expect } = Lab;

const createTelemetryPost = (server, eventType, data, authorization) => {
  return server.inject({
      method: 'POST',
      url: '/prosody/telemetry',
      payload: {
        eventType,
        data: JSON.stringify(data)
      },
      headers: {
        authorization
      }
    }) 
}

describe('Telemetry', () => {
  let user, server, room
  const createRoomInfo = { roomId: 'randomRoomId', name: 'test-room', jid: 'test-room@talky.io.tests' }
  before(() => {
    return Server
      .then((s) => {
        server = s;
        return setupUser(server)
      })
      .then((u) => {
        user = u
        return createRoom(server, createRoomInfo)
      })
      .then(() => db.rooms.findOne({ roomid: createRoomInfo.roomId }))
      .then((r) => (room = r))
  });

  after(() => {
    return Promise.all([
      db.rooms.destroy({ roomid: createRoomInfo.roomId }),
      db.users.destroy({ sessionid: user.sessionId })
    ]);
  })

  it('should add an event', () => {
    return createTelemetryPost(
      server,
      'message_sent',
      { sessionId: user.sessionId },
      createProsodyAuthHeader('newUser')
    )
    .then(() => db.events.findOne({ type: 'message_sent', actor_id: user.sessionId }))
    .then((e) => expect(e).to.not.be.null())
    .then(() => db.events.destroy({ type: 'message_sent', actor_id: user.sessionId }))
  });

  it('should create a room if one hasnt been created - prosody', () => {
    const roomId = 'newRoomId';
    return db.rooms.findOne({ roomid: roomId })
    .then((r) => {
      return expect(r).to.equal(null)
    })
    .then(() => {
      return createTelemetryPost(
        server,
        'room_created',
        { roomId, name: 'test-room', jid: 'test-room@talky.io.tests' },
        createProsodyAuthHeader('newUser')
      )
    })
    .then((res) => {
      return db.rooms.findOne({ roomid: roomId })
    })
    .then((room) => {
      expect(room.roomid).to.equal(roomId)
      return db.rooms.destroy({ roomid: roomId })
    })
  });

  it('should update ended_at if event is `room_destroyed`', () => {
    return db.rooms.findOne({ roomid: createRoomInfo.roomId })
    .then((room) => {
      return expect(room.ended_at).to.be.null()
    })
    .then(() => {
      return createTelemetryPost(
        server,
        'room_destroyed',
        createRoomInfo,
        createProsodyAuthHeader('newUser')
      )
    })
    .then(() => {
      return db.rooms.findOne({ roomid: createRoomInfo.roomId })
    })
    .then((room) => {
      expect(room.ended_at).to.not.be.null()
    })
  })

  it('should update ended_at if event is `user_offline`', () => {
    return db.users.findOne({ sessionid: user.sessionId })
    .then((user) => {
      return expect(user.ended_at).to.be.null()
    })
    .then(() => {
      return createTelemetryPost(
        server,
        'user_offline',
        { sessionId: user.sessionId },
        createProsodyAuthHeader('newUser')
      )
    })
    .then(() => {
      return db.users.findOne({ sessionid: user.sessionId })
    })
    .then((user) => {
      expect(user.ended_at).to.not.be.null()
    })
  });

  it('should updated created_at when a user is online', () => {
    let originalCreatedAt;
    return db.users.findOne({ sessionid: user.sessionId })
    .then((user) => (originalCreatedAt = user.created_at))
    .then(() => {
      return createTelemetryPost(
        server,
        'user_online',
         { sessionId: user.sessionId },
        createProsodyAuthHeader('newUser')
      )
    })
    .then(() => {
      return db.users.findOne({ sessionid: user.sessionId })
    })
    .then((user) => {
      expect(user.created_at).to.not.equal(originalCreatedAt)
    })
  })
});
