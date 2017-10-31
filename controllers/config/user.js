'use strict';

const Config = require('getconfig');
const Joi = require('joi');
const JWT = require('jsonwebtoken');
const UUID = require('uuid');
const Boom = require('boom');
const UAParser = require('ua-parser-js');
const Base32 = require('base32-crockford-browser');
const Schema = require('../../lib/schema');

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
  handler: async function (request, reply) {

    let license = {};
    try {
      license = await CheckLicense();
    }
    catch (err) {
      return reply(err);
    }

    // Query DB for the active user count
    const currentUserCount = 0;
    if (license.userLimit !== undefined && (currentUserCount + 1 > license.userLimit)) {
      return reply(Boom.forbidden('Talky Core active user limit reached'));
    }


    let customerData = {};
    try {
      customerData = await ExtractCustomerData(request.payload.token);
    }
    catch (err) {
      return reply(Boom.badRequest('Could not parse user data'));
    }

    const { ua, browser, device, os } = UAParser(request.headers['user-agent']);

    const id = UUID.v4();
    const username = Base32.encode(JSON.stringify({
      id: customerData.id,
      scopes: customerData.scopes || []
    }));
    const user_id = `${username}@${Domains.users}`;
    const ice = FetchICE(DEFAULT_ORG, id);

    try {
      await this.db.sessions.insert({
        id,
        user_id,
        type: device.type === undefined ? 'desktop' : 'mobile',
        os: JSON.stringify(os),
        useragent: ua,
        browser: JSON.stringify(browser)
      });
    }
    catch (err) {
      request.log(['error', 'users'], err);
    }

    const result = {
      id,
      userId: user_id,
      orgId: DEFAULT_ORG,
      signalingUrl: `${BuildUrl('ws', Domains.signaling)}/ws-bind`,
      telemetryUrl: `${BuildUrl('http', Domains.api)}/telemetry`,
      roomServer: Domains.rooms,
      iceServers: ice,
      displayName: customerData.displayName || '',
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

    return reply(result);
  },
  response: {
    status: {
      200: Schema.user
    }
  },
  validate: {
    payload: {
      token: Joi.string().description('JWT encoded user object').label('UserToken')
    }
  }
};
