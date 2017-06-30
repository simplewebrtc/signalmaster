const Config = require('getConfig');
const Muckracker = require('muckraker');
const Crypto = require('crypto');
const Server = require('../server');

const setupUser = (server) => server.inject({ method: 'POST', url: '/config/guest', payload: {} }).then((r) => r.result)

const createProsodyAuthHeader = (username) => {
  const password = Crypto.createHmac('sha1', Buffer.from(Config.auth.secret)).update(username).digest('base64')
  return  'Basic ' + (new Buffer(username + ':' + password, 'utf8')).toString('base64')
}

const createRoom = (server, roomInfo) => server.inject({
    method: 'POST',
    url: '/prosody/telemetry',
    payload: {
      eventType: 'room_created',
      data: roomInfo
    },
    headers: {
      authorization: createProsodyAuthHeader('testUser')
    }
  })

module.exports = {
  db: new Muckracker({ connection: Config.db }),
  setupUser,
  createRoom,
  createProsodyAuthHeader
}