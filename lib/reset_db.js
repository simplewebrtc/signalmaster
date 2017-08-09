'use strict';

module.exports = async function (db, action) {

  await Promise.all([
    db.events.system_restart_sessions({ action }),
    db.events.system_restart_rooms({ action })
  ]);

  await Promise.all([
    db.rooms.end_all(),
    db.sessions.end_all()
  ]);
};
