'use strict';


module.exports = function (domains) {
  const API = domains.api;
  return {
    api: domains.api,
    rooms: domains.rooms || `rooms.${API}`,
    users: domains.users || `users.${API}`,
    guests: domains.guests || `guests.${API}`,
    bots: domains.bots || `bots.${API}`,
  };
};

