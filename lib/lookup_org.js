'use strict';

const Config = require('getconfig');
const { promisify } = require('util');


module.exports = async function ({ orgId, redis }) {

  if (!orgId) {
    return null;
  }

  orgId = orgId.toLowerCase();

  if (redis) {
    // The billing system keeps account information updated
    // in the `swrtcpro_orgs` hash key.
    const getKey = promisify(redis.hget.bind(redis));
    const orgData = await getKey('swrtcpro_orgs', orgId);

    if (orgData) {
      const data = JSON.parse(orgData);
      if (!data.active) {
        return null;
      }
      return data;
    }
  }

  // If we are running without the billing system, check
  // for any configured orgs:
  if (Config.talky.orgs[orgId]) {
    const data = { ...Config.talky.orgs[orgId], id: orgId, key: orgId };
    if (!data.active) {
      return null;
    }
    return data;
  }

  return null;
};

