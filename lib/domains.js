'use strict';

module.exports = function (domains) {

  const api = domains.api;
  return {
    api,
    api_private: domains.api_private || api,
    rooms: domains.rooms || `rooms.${api}`,
    users: domains.users || `users.${api}`,
    guests: domains.guests || `guests.${api}`,
    bots: domains.bots || `bots.${api}`,
    signaling: domains.signaling || domains.api
  };
};
