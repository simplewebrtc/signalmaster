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
      //url: '/prosody/telemetry',
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

  //it('should update ended_at if event is `user_offline`', () => {
    //return db.users.findOne({ sessionid: user.sessionId })
    //.then((user) => {
      //return expect(user.ended_at).to.be.null()
    //})
    //.then(() => {
      //return createTelemetryPost(
        //server,
        //'user_offline',
        //{ sessionId: user.sessionId },
        //createProsodyAuthHeader('newUser')
      //)
    //})
    //.then(() => {
      //return db.users.findOne({ sessionid: user.sessionId })
    //})
    //.then((user) => {
      //expect(user.ended_at).to.not.be.null()
    //})
  //});

  //it('should updated created_at when a user is online', () => {
    //let originalCreatedAt;
    //return db.users.findOne({ sessionid: user.sessionId })
    //.then((user) => (originalCreatedAt = user.created_at))
    //.then(() => {
      //return createTelemetryPost(
        //server,
        //'user_online',
         //{ sessionId: user.sessionId },
        //createProsodyAuthHeader('newUser')
      //)
    //})
    //.then(() => {
      //return db.users.findOne({ sessionid: user.sessionId })
    //})
    //.then((user) => {
      //expect(user.created_at).to.not.equal(originalCreatedAt)
    //})
  //})
//});
