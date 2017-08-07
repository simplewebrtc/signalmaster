'use strict';

const Config = require('getconfig');
const Joi = require('joi');
const JWT = require('jsonwebtoken');
const UUID = require('uuid');
const Boom = require('boom');
const uaParser = require('ua-parser-js');
const Schema = require('../../lib/schema');

const buildUrl = require('../../lib/buildUrl');
const fetchICE = require('../../lib/fetchIce');
const inflateDomains = require('../../lib/domains');
const checkLicense = require('../../lib/licensing');

const TalkyCoreConfig = require('getconfig').talky;
const Domains = inflateDomains(TalkyCoreConfig.domains);


module.exports = {
  description: 'Auto-configure a registered user client session',
  tags: ['api', 'config'],
  handler: async function (request, reply) {

    let license = {};
    try {
      license = await checkLicense();
    } catch (err) {
      return reply(err);
    }

    // Query DB for the active user count
    const currentUserCount = 0;
    if (license.userLimit !== undefined && (currentUserCount + 1 > license.userLimit)) {
      return reply(Boom.forbidden('Talky Core active user limit reached'));
    }

    let ice = [];
    try {
      ice = await fetchICE();
    } catch (err) {
      console.error(err, 'Could not fetch ICE servers');
    }

    const { ua, browser, device, os } = uaParser(request.headers['user-agent']);

    const sessionId = UUID.v4();
    const userId = `${sessionId}@${Domains.guests}`;

    try {
      await this.db.users.insert({
        sessionid: sessionId,
        userid: userId,
        type: device.type === undefined ? 'desktop' : 'mobile',
        os: JSON.stringify(os),
        useragent: ua,
        browser: JSON.stringify(browser)
      });
    } catch (err) {
      request.log(['error', 'users', 'guest'], err);
    }

    const result = {
      sessionId,
      userId,
      signalingUrl: `${buildUrl('ws', Domains.api)}/ws-bind`,
      telemetryUrl: `${buildUrl('http', Domains.api)}/telemetry`,
      roomServer: Domains.rooms,
      iceServers: ice,
      displayName: '',
      credential: JWT.sign({
        sessionId,
        registeredUser: false
      }, Config.auth.secret, {
        algorithm: 'HS256',
        expiresIn: '1 day',
        issuer: Domains.api,
        audience: Domains.guests,
        subject: userId
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
