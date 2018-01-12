'use strict';

const Config = require('getconfig');
const Joi = require('joi');
const JWT = require('jsonwebtoken');
const UUID = require('uuid');
const Boom = require('boom');
const UAParser = require('ua-parser-js');
const Base32 = require('base32-crockford-browser');
const Schema = require('../../lib/schema');
const { promisify } = require('util');

const BuildUrl = require('../../lib/build_url');
const FetchICE = require('../../lib/fetch_ice');
const InflateDomains = require('../../lib/domains');
const CheckLicense = require('../../lib/licensing');
const ExtractCustomerData = require('../../lib/customer_data');

const TalkyCoreConfig = require('getconfig').talky;
const Domains = InflateDomains(TalkyCoreConfig.domains);

const DEFAULT_ORG = 'andyet';


module.exports = {
  description: 'Auto-configure a registered user client session',
  tags: ['api', 'config'],
  handler: async function (request, h) {

    const license = await CheckLicense();

    // Query DB for the active user count
    const currentUserCount = 0;
    if (license.userLimit !== undefined && (currentUserCount + 1 > license.userLimit)) {
      return Boom.forbidden('Talky Core active user limit reached');
    }


    const customerData = await ExtractCustomerData(request.payload.token);
    const { ua, browser, device, os } = UAParser(request.headers['user-agent']);

    const id = UUID.v4();
    const username = Base32.encode(JSON.stringify({
      id: customerData.id,
      scopes: customerData.scopes || []
    }));
    const user_id = `${username}@${Domains.users}`;
    const ice = FetchICE(DEFAULT_ORG, id);

    const redis_rpush = promisify(this.redis.rpush.bind(this.redis));
    const event = {
      type: 'user_created',
      actor_id: id,
      user_id,
      device_type: device.type === undefined ? 'desktop' : 'mobile',
      os: JSON.stringify(os),
      useragent: ua,
      browser: JSON.stringify(browser),
      created_at: new Date(),
      updated_at: new Date()
    };
    await redis_rpush('events', JSON.stringify(event));

    const result = {
      id,
      userId: user_id,
      orgId: request.params.orgId || DEFAULT_ORG,
      signalingUrl: `${BuildUrl('ws', Domains.signaling)}/ws-bind`,
      telemetryUrl: `${BuildUrl('http', Domains.api)}/telemetry`,
      roomServer: Domains.rooms,
      iceServers: ice,
      displayName: customerData.displayName || '',
      apiVersion: Config.talky.apiVersion,
      screensharingExtensions: TalkyCoreConfig.screensharingExtensions || {},
      credential: JWT.sign({
        id,
        orgId: DEFAULT_ORG,
        registeredUser: true
      }, Config.auth.secret, {
        algorithm: 'HS256',
        expiresIn: '1 day',
        issuer: Domains.api,
        audience: Domains.guests,
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
    payload: {
      token: Joi.string().description('JWT encoded user object').label('UserToken')
    }
  }
};
