'use strict';

const JID = require('./jid');


module.exports = (roomAddress) => {

  // TODO: Remove once we no longer are omitting the talky# prefix
  if (roomAddress.indexOf('#') < 0) {
    roomAddress = `talky#${roomAddress}`;
  }

  const roomParts = JID.local(roomAddress).split('#');

  const roomInfo = {
    orgId: roomParts[0]
  };

  return roomInfo;
};

