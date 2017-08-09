'use strict';

exports.split = (jid) => {

  return {
    local: exports.local(jid),
    domain: exports.domain(jid),
    resource: exports.resource(jid),
    bare: exports.bare(jid)
  };
};

exports.bare = (jid) => {

  return jid.split('/')[0].toLowerCase();
};

exports.local = (jid) => {

  const bareJID = exports.bare(jid);
  return bareJID.split('@')[0].toLowerCase();
};

exports.domain = (jid) => {

  const bareJID = exports.bare(jid);
  if (bareJID.indexOf('@') >= 0) {
    return bareJID.split('@')[1].toLowerCase();
  }
  return bareJID;

};

exports.resource = (jid) => {

  const resourceParts = jid.split('/');
  resourceParts.shift();
  return resourceParts.join('/');
};

exports.equal = (jid1, jid2) => {

  return exports.equalBare(jid1, jid2) &&
      exports.resource(jid1) === exports.resource(jid2);
};

exports.equalBare = (jid1, jid2) => {

  return exports.bare(jid1) === exports.bare(jid2);
};
