//const Lab = require('lab');
//const JWT = require('jsonwebtoken');
//const Config = require('getconfig')
//const { db, createRoom, setupUser, createProsodyAuthHeader } = require('./utils');
//const Server = require('../server');
//const license = require('../lib/licensing');
//const Base32 = require('base32-crockford-browser');

//const lab = exports.lab = Lab.script();

//const { describe, it, before, after, afterEach } = lab
//const { expect } = Lab;

//describe('Rooms Affiliation', () => {
  //let server, user, room;
  //const createRoomInfo = { roomId: 'randomRoomId', name: 'test-room', jid: 'test-room@talky.io.tests' }

  //before(() => {
    //return Server.then((s) => {
      //server = s
      //return setupUser(server)
    //})
    //.then((u) => {
      //user = u
      //return createRoom(server, createRoomInfo)
    //})
    //.then((r) => (room = r))
  //});

  //after(() => {
    //return Promise.all([
      //db.rooms.destroy({ roomid: createRoomInfo.roomId }),
      //db.users.destroy({ sessionid: user.sessionId })
    //]);
  //})

  //it('Should return `owner` ', () => {
    //return server.inject({
      //method: 'POST', 
      //url: '/prosody/rooms/affiliation',
      //payload: { roomId: room.roomid, userId: user.sessionId },
      //headers: { authorization: createProsodyAuthHeader('newUser') } 
    //})
    //.then((res) => {
      //expect(res.statusCode).to.equal(200);
      //expect(res.result).to.equal('owner');
    //})
  //})
  
  //it('should only allow authed requests', () => {
    //return server.inject({
      //method: 'POST', 
      //url: '/prosody/rooms/affiliation',
      //payload: { roomId: room.roomid, userId: user.userId },
      //headers: { authorization: 'wrong' } 
    //})
    //.then((res) => {
      //expect(res.statusCode).to.equal(401);
    //})
  //})
//});
