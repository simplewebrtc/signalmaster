'use strict';

const Config = require('getconfig');
const { promisify } = require('util');


module.exports = async function (orgId, redis) {

  if (redis) {
    const getKey = promisify(redis.hget.bind(redis));
    const orgData = await getKey('orgs', orgId);
    if (orgData) {
      const data = JSON.parse(orgData);
      if (!data.enabled) {
        return null;
      }
      return data;
    }
  }

  if (Config.talky.orgs[orgId]) {
    const data = { ...Config.talky.orgs[orgId], id: orgId };
    if (!data.enabled) {
      return null;
    }
    return data;
  }

  return null;
};

