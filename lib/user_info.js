'use strict';

const Base32 = require('base32-crockford-browser');

const JID = require('./jid');
const Domains = require('./domains');

module.exports = ({ user_id, session_id }) => {

  const domain = JID.domain(user_id);
  const userpart = JID.local(user_id);
  const user = userpart.split('#');
  const id = session_id || user[1];

  const userInfo = {
    id,
    orgId: user[0]
  };

  switch (domain) {
    case Domains.users: {
      userInfo.userType = 'registered';
      userInfo.customerData = JSON.parse(Base32.decode(user[2]));
      break;
    }

    default: {
      userInfo.userType = 'guest';
      userInfo.customerData = { id: 'anon' };
    }
  }

  return userInfo;
};
