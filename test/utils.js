//const Config = require('getConfig');
//const Crypto = require('crypto');
//const Server = require('../server');
//const JWT = require('jsonwebtoken');

//const setupUser = (server, role = 'guest') => {
  //if (role === 'guest') return server.inject({ method: 'POST', url: '/config/guest', payload: {} }).then((r) => r.result)
  //if (role === 'user') {
    //const token = JWT.sign({ id: 4, scopes: ['mod']}, Config.talky.apiKey, {
      //algorithm: 'HS256',
      //expiresIn: '1 day'
    //})
    //return server.inject({ method: 'POST', url: '/config/user', payload: { token } }).then((r) => r.result)
  //}
  //if (role === 'bot') return server.inject({ method: 'POST', url: '/config/bot', payload: {} }).then((r) => r.result)
//}

//const createProsodyAuthHeader = (username) => {
  //const password = Crypto.createHmac('sha1', Buffer.from(Config.auth.secret)).update(username).digest('base64')
  //return  'Basic ' + (new Buffer(username + ':' + password, 'utf8')).toString('base64')
//}

//const createRoom = (server, roomInfo) => server.inject({
    //method: 'POST',
    //url: '/prosody/telemetry',
    //payload: {
      //eventType: 'room_created',
      //data: roomInfo
    //},
    //headers: {
      //authorization: createProsodyAuthHeader('testUser')
    //}
  //})
  //.then(() => {
    //return db.rooms.findOne({ id: roomInfo.id })
  //})

//module.exports = {
  //setupUser,
  //createRoom,
  //createProsodyAuthHeader
//}
