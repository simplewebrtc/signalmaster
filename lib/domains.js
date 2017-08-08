'use strict';


module.exports = function (domains) {
  
  // To test locally set `rooms` to ‘talky.io’, and `guests` to ‘anon.talky.me’ in the domains section in config
  const API = domains.api;
  return {
    api: domains.api,
    rooms: domains.rooms || `rooms.${API}`,
    users: domains.users || `users.${API}`,
    guests: domains.guests || `guests.${API}`,
    bots: domains.bots || `bots.${API}`,
  };
};

