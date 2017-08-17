'use strict';

const Config = require('getconfig');
const JWT = require('jsonwebtoken');
const UUID = require('uuid');
const Boom = require('boom');
const UAParser = require('ua-parser-js');
const Schema = require('../../lib/schema');

const BuildUrl = require('../../lib/build_url');
const FetchICE = require('../../lib/fetch_ice');
const InflateDomains = require('../../lib/domains');
const CheckLicense = require('../../lib/licensing');

const TalkyCoreConfig = require('getconfig').talky;
const Domains = InflateDomains(TalkyCoreConfig.domains);


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

    const ice = await FetchICE(request);

    const { ua, browser, device, os } = UAParser(request.headers['user-agent']);

    const id = UUID.v4();
    const user_id = `${id}@${Domains.guests}`;

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
      request.log(['error', 'users', 'guest'], err);
    }

    const result = {
      id,
      userId: user_id,
      signalingUrl: TalkyCoreConfig.overrideGuestSignalingUrl || `${BuildUrl('ws', Domains.signaling)}/ws-bind`,
      telemetryUrl: `${BuildUrl('http', Domains.api)}/telemetry`,
      roomServer: Domains.rooms,
      iceServers: ice,
      displayName: '',
      screensharingExtensions: TalkyCoreConfig.screensharingExtensions || {},
      credential: JWT.sign({
        id,
        registeredUser: false
      }, Config.auth.secret, {
        algorithm: 'HS256',
        expiresIn: '1 day',
        issuer: Domains.api,
        audience: Domains.guests,
        subject: id
      })
    };

    return reply(result);
  },
  response: {
    status: {
      200: Schema.guest
    }
  }
};
