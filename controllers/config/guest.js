'use strict';

const Config = require('getconfig');
const Joi = require('joi');
const JWT = require('jsonwebtoken');
const UUID = require('uuid');
const Boom = require('boom');
const UAParser = require('ua-parser-js');
const Schema = require('../../lib/schema');
const { promisify } = require('util');

const BuildUrl = require('../../lib/build_url');
const FetchICE = require('../../lib/fetch_ice');
const InflateDomains = require('../../lib/domains');
const CheckLicense = require('../../lib/licensing');
const LookupOrg = require('../../lib/lookup_org');

const TalkyCoreConfig = require('getconfig').talky;
const Domains = InflateDomains(TalkyCoreConfig.domains);

const DEFAULT_ORG = Config.talky.defaultOrg;


module.exports = {
  description: 'Auto-configure a registered user client session',
  tags: ['api', 'config'],
  handler: async function (request, h) {

    const license = await CheckLicense();

    const org = await LookupOrg(request.params.orgId || DEFAULT_ORG, this.redis);
    if (!org) {
      return Boom.forbidden('Account not enabled');
    }

    // Query DB for the active user count
    const currentUserCount = 0;
    if (license.userLimit !== undefined && (currentUserCount + 1 > license.userLimit)) {
      return Boom.forbidden('Talky Core active user limit reached');
    }

    const { ua, browser, os } = UAParser(request.headers['user-agent']);

    const id = UUID.v4();
    const org_id = org.id;
    const user_id = `${org_id}#${id}@${Domains.guests}`;
    const ice = FetchICE(org_id, id);

    const redis_rpush = promisify(this.redis.rpush.bind(this.redis));
    const event = {
      type: 'user_created',
      actor_id: id,
      org_id,
      user_id,
      device_type: ua.indexOf('Mozilla') >= 0 ? 'desktop' : 'mobile',
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
      orgId: org_id,
      signalingUrl: TalkyCoreConfig.overrideGuestSignalingUrl || `${BuildUrl('ws', Domains.signaling)}/ws-bind`,
      telemetryUrl: `${BuildUrl('http', Domains.api)}/telemetry`,
      roomConfigUrl: `${BuildUrl('http', Domains.api)}/config/room`,
      roomServer: Domains.rooms,
      iceServers: ice,
      displayName: '',
      screensharingExtensions: org.screensharingExtensions || TalkyCoreConfig.screensharingExtensions || {},
      apiVersion: Config.talky.apiVersion,
      credential: JWT.sign({
        id,
        orgId: org_id,
        registeredUser: false
      }, Config.auth.secret, {
        algorithm: 'HS256',
        expiresIn: '1 day',
        issuer: Domains.api,
        audience: Domains.guests,
        subject: `${org_id}#${id}`
      })
    };

    return result;
  },
  validate: {
    params: {
      orgId: Joi.string().example('andyet')
    }
  },
  response: {
    status: {
      200: Schema.guest
    }
  }
};
