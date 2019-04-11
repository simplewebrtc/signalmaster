'use strict';

const Config = require('getconfig');
const Joi = require('joi');
const JWT = require('jsonwebtoken');
const UUID = require('uuid');
const Boom = require('boom');
const UAParser = require('ua-parser-js');
const Base32 = require('base32-crockford-browser');
const StableStringify = require('json-stringify-deterministic');

const Schema = require('../../lib/schema');
const { promisify } = require('util');

const BuildUrl = require('../../lib/build_url');
const FetchICE = require('../../lib/fetch_ice');
const Domains = require('../../lib/domains');
const ExtractCustomerData = require('../../lib/customer_data');
const LookupOrg = require('../../lib/lookup_org');

module.exports = {
  description: 'Auto-configure a registered user client session',
  tags: ['api', 'config'],
  handler: async function (request, h) {

    const org = await LookupOrg({ orgId: request.params.orgId, redis: this.redis });
    if (!org) {
      return Boom.forbidden('Account not enabled');
    }

    // Handle both org.secrets and org.secret until org.secret is discontinued
    let orgSecrets = [];
    if (org.secrets && org.secrets.length) {
      orgSecrets = org.secrets;
    }
    else if (org.secret) {
      orgSecrets = [org.secret];
    }

    const customerData = await ExtractCustomerData({ token: request.payload.token, apiSecrets: orgSecrets } );
    const { ua, browser, os } = UAParser(request.headers['user-agent']);

    const encodedCustomerData = Base32.encode(StableStringify(customerData));

    const id = UUID.v4();
    const org_id = org.key;

    // HISTORY: The original format we used for the username of JIDs was
    //   sessionid@domain for guests, and sessionid#data@domain for
    //   users with customer data. Later, we added an org (customer)
    //   id prefix, again delimited by #. So the full format is now
    //   customer#sessionid#data@domain
    //
    //   The talky org was special, since we had to grandfather in the
    //   older iOS client that generated its own JID. So if a JID doesn't
    //   have the expected number of segments, we assume it was for the talky
    //   iOS client.
    //
    //   We no longer want sessionid included in the JID for non-guest users
    //   so that we can consistently and predictably generate them based on
    //   customer JWT data. So for now, we end up with an empty second segment,
    //   hence the odd looking '##" in the username here.
    const username = `${org_id}##${encodedCustomerData}`;
    const user_id = `${username}@${Domains.users}`;
    const ice = FetchICE({ org_id, session_id: id });
    const sdkVersion = request.payload.clientVersion;


    const redis_rpush = promisify(this.redis.rpush.bind(this.redis));
    const event = {
      type: 'user_created',
      actor_id: id,
      user_id,
      org_id,
      device_type: ua.indexOf('Mozilla') >= 0 ? 'desktop' : 'mobile',
      os: JSON.stringify(os),
      useragent: ua,
      browser: JSON.stringify(browser),
      sdk_version: sdkVersion,
      created_at: new Date(),
      updated_at: new Date()
    };
    await redis_rpush('events', JSON.stringify(event));

    const overridePort = Config.getconfig.isDev ? 5280 : 80;

    const result = {
      id,
      userId: user_id,
      orgId: org_id,
      customerData,
      signalingUrl: `${BuildUrl({ proto: 'ws', domain: Domains.signaling, overridePort })}/ws-bind`,
      telemetryUrl: `${BuildUrl({ proto: 'http', domain: Domains.api })}/telemetry`,
      roomConfigUrl: `${BuildUrl({ proto: 'http', domain: Domains.api })}/config/room`,
      roomServer: Domains.rooms,
      iceServers: ice,
      displayName: customerData.displayName || '',
      apiVersion: Config.talky.apiVersion,
      screensharingExtensions: org.screensharingExtensions || {},
      credential: JWT.sign({
        id,
        orgId: org_id,
        registeredUser: true,
        sdkVersion
      }, Config.auth.secret, {
        algorithm: 'HS256',
        expiresIn: '1 day',
        issuer: Domains.api,
        audience: Domains.users,
        subject: username
      })
    };

    return result;
  },
  response: {
    status: {
      200: Schema.user
    }
  },
  validate: {
    params: {
      orgId: Joi.string().example('andyet')
    },
    payload: Joi.object({
      clientVersion: Joi.string().optional().default('').description('Client SDK version').example('1.7.3'),
      token: Joi.string().description('JWT encoded user object').label('UserToken')
    }).default({}).unknown()
  }
};
