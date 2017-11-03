'use strict';

const Config = require('getconfig');
const Base32 = require('base32-crockford-browser');

const JID = require('./jid');
const InflateDomains = require('./domains');

const Domains = InflateDomains(Config.talky.domains);

const DEFAULT_ORG = 'andyet';


module.exports = (userId, sessionId) => {

  const domain = JID.domain(userId);
  const user = JID.local(userId);

  const userInfo = {
    id: sessionId,
    orgId: DEFAULT_ORG
  };

  switch (domain) {
    case Domains.users: {
      userInfo.userType = 'registered';
      userInfo.customerData = JSON.parse(Base32.decode(user));
      break;
    }

    case Domains.bots: {
      userInfo.id = user;
      userInfo.userType = 'bot';
      userInfo.customerData = { id: user };
      break;
    }

    default: {
      userInfo.userType = 'guest';
      userInfo.customerData = { id: 'anon' };
    }
  }

  return userInfo;
};
