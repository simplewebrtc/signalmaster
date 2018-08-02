'use strict';

const Config = require('getconfig');
const Base32 = require('base32-crockford-browser');

const JID = require('./jid');
const InflateDomains = require('./domains');

const Domains = InflateDomains(Config.talky.domains);


module.exports = (userId, sessionId) => {

  const domain = JID.domain(userId);
  const userpart = JID.local(userId);
  const user = userpart.split('#');

  const userInfo = {
    id: user[1],
    orgId: user[0]
  };

  switch (domain) {
    case Domains.users: {
      userInfo.userType = 'registered';
      userInfo.customerData = JSON.parse(Base32.decode(user[2]));
      break;
    }

    case Domains.bots: {
      userInfo.id = user[1];
      userInfo.userType = 'bot';
      userInfo.customerData = { id: user[1] };
      break;
    }

    default: {
      userInfo.userType = 'guest';
      userInfo.customerData = { id: 'anon' };
    }
  }

  return userInfo;
};
