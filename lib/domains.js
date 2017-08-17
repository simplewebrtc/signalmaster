'use strict';

module.exports = function (domains) {

  const api = domains.api;
  return {
    api,
    rooms: domains.rooms || `rooms.${api}`,
    users: domains.users || `users.${api}`,
    guests: domains.guests || `guests.${api}`,
    bots: domains.bots || `bots.${api}`,
    signaling: domains.signaling || domains.api
  };
};
