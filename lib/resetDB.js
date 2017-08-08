module.exports = async function (db) {
  const time = new Date(Date.now());

  const rooms = await db.rooms.get_active();
  const users = await db.rooms.get_active();

  for (const room of rooms) {
    db.events.insert({
      type: 'system_reset',
      room_id: room.roomid,
      actor_id: null
    });
  }

  for (const user of users) {
    db.events.insert({
      type: 'system_reset',
      room_id: null,
      actor_id: user.sessionid
    });
  }

  await Promise.all([
    db.rooms.end_all({ ts: time }),
    db.users.end_all({ ts: time })
  ]);
};
