//const Lab = require('lab');
//const JWT = require('jsonwebtoken');
//const Config = require('getconfig')
//const Crypto = require('crypto')
//const { db, setupUser, createRoom, createProsodyAuthHeader } = require('./utils');
//const Server = require('../server');
//const license = require('../lib/licensing');
//const Base32 = require('base32-crockford-browser');

//const lab = exports.lab = Lab.script();

//const { describe, it, before, after, afterEach } = lab
//const { expect } = Lab;

//const createTelemetryPost = (server, eventType, data, authorization) => {
  //return server.inject({
      //method: 'POST',
      //url: '/telemetry',
      //payload: {
        //eventType,
        //data: JSON.stringify(data)
      //},
      //headers: {
        //authorization
      //}
    //}) 
//}

//describe('Telemetry', () => {
  //let user, server, room
  //const createRoomInfo = { roomId: 'randomRoomId', name: 'test-room', jid: 'test-room@talky.io.tests' }
  //before(() => {
    //return Server
      //.then((s) => {
        //server = s;
        //return setupUser(server)
      //})
      //.then((u) => {
        //user = u
        //return createRoom(server, createRoomInfo)
      //})
      //.then(() => db.rooms.findOne({ roomid: createRoomInfo.roomId }))
      //.then((r) => (room = r))
  //});

  //after(() => {
    //return Promise.all([
      //db.rooms.destroy({ roomid: createRoomInfo.roomId }),
      //db.users.destroy({ sessionid: user.sessionId })
    //]);
  //})

  //it('should insert events - client', () => {
    //return createTelemetryPost(server, 'video_paused', { roomId: room.roomid }, user.credential)
    //.then((res) => {
      //expect(res.statusCode).to.equal(200)
      //return db.events.findOne({ actor_id: user.sessionId })
    //})
    //.then((found) => {
      //expect(found.room_id).to.equal(room.roomid)
      //expect(found.type).to.equal('video_paused')
    //})
  //});

  //it('should return a 401 if no headers are present - client', () => {
    //return createTelemetryPost(server, 'video_paused', {}, null)
    //.then((res) => {
      //expect(res.statusCode).to.equal(401)
    //})
  //});

  //it('should return a 500 if bad eventType sent - client', () => {
    //return createTelemetryPost(server, 'bad_event', {}, user.credential)
    //.then((res) => {
      //expect(res.statusCode).to.equal(500)
    //})
  //})
//});
