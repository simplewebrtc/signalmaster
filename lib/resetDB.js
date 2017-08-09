module.exports = async function (db, action) {

  await Promise.all([
    db.events.system_restart_users({ action }),
    db.events.system_restart_rooms({ action }),
  ]);

  await Promise.all([
    db.rooms.end_all(),
    db.users.end_all()
  ]);
};
