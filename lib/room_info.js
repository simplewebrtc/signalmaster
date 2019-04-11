'use strict';

const JID = require('./jid');


module.exports = ({ room_id }) => {

  // TODO: Remove once we no longer are omitting the talky# prefix
  if (room_id.indexOf('#') < 0) {
    room_id = `talky#${room_id}`;
  }

  const roomParts = JID.local(room_id).split('#');

  const roomInfo = {
    orgId: roomParts[0]
  };

  return roomInfo;
};

