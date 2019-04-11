'use strict';

const Config = require('getconfig');

const domains = Config.talky.domains;

const api = domains.api;
const api_private = domains.api_private || api;

module.exports = {
  api,
  api_private,
  rooms: domains.rooms || `rooms.${api}`,
  users: domains.users || `users.${api}`,
  guests: domains.guests || `guests.${api}`,
  bots: domains.bots || `bots.${api}`,
  signaling: domains.signaling || domains.api
};
