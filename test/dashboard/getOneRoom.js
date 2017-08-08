const Lab = require('lab');
const Code = require('code');
const JWT = require('jsonwebtoken');
const Config = require('getconfig')
const Crypto = require('crypto');
const { db, createRoom, setupUser, createProsodyAuthHeader } = require('./utils');
const Server = require('../server');
const cheerio = require('cheerio');
const license = require('../lib/licensing');
const Base32 = require('base32-crockford-browser');

const lab = exports.lab = Lab.script();

const { describe, it, before, after, afterEach } = lab
const { expect } = Code;

describe('GET /dashboard/rooms/{roomId}', () => {

  let server, user, room;
  const room = Fixtures.room();
  const otherRoom = Fixtures.room({ jid: room });
  //const createRoomInfo = { roomId: 'randomRoomId', name: 'test-room', jid: `test-room@talky.io.tests` }
  //const otherRoomInfo = { roomId: 'otherRoomId', name: 'test-room', jid: `test-room@talky.io.tests` }
  
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

  before(async() => {
    server = await Server
    room = await createRoom(server, room)
  });

  after(async () => {
    await db.rooms.destroy({ roomid: otherRoomInfo.roomId })
    await db.rooms.destroy({ roomid: createRoomInfo.roomId })
  })

  it('Should send proper data to view for room', () => {
    let guestUser
    return server.inject({ method: 'GET', url: `/dashboard/rooms/${room.roomid}`})
    .then((res) => {
      const $ = cheerio.load(res.result)
      const roomInfo = $('td').map(function() {
        return $(this).text().trim()
      }).get()
      expect(roomInfo).to.include('randomRoomId') // Resource
      expect(roomInfo).to.include(Crypto.createHash('sha1').update(createRoomInfo.name).digest('base64')) // Name
      expect(roomInfo).to.include('room_created') // Creation event
    })
  })

  it('Should show that events that occur', () => {
    return server.inject({
      method: 'POST',
      url: '/prosody/telemetry',
      payload: {
        eventType: 'room_destroyed',
        data: createRoomInfo
      },
      headers: {
        authorization: createProsodyAuthHeader('newUser')
      }
    })
    .then(() => server.inject({ method: 'GET', url: `/dashboard/rooms/${room.roomid}`}))
    .then((res) => {
      const $ = cheerio.load(res.result)
      const roomInfo = $('td').map(function() {
        return $(this).text().trim()
      }).get()
      expect(roomInfo).to.include('room_destroyed') // Destroyed event
    })
  });

  it('Should show previous rooms', async () => {
    await createRoom(server, otherRoomInfo)
    const { result } = await server.inject({ method: 'GET', url: `/dashboard/rooms/${otherRoomInfo.roomId}`})
    const $ = cheerio.load(result);
    const nextInstance = $('th').filter(function() {
      return $(this).text().trim() === 'Previous instance';
    })
    expect(nextInstance.length).to.equal(1)
  });

  it('Should show next rooms', async () => {
    await createRoom(server, otherRoomInfo)
    const { result } = await server.inject({ method: 'GET', url: `/dashboard/rooms/${createRoomInfo.roomId}`})
    const $ = cheerio.load(result);
    const nextInstance = $('th').filter(function() {
      return $(this).text().trim() === 'Next instance';
    })
    expect(nextInstance.length).to.equal(1)
  });

});
