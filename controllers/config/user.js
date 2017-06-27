'use strict';

const Config = require('getconfig');
const Joi = require('joi');
const JWT = require('jsonwebtoken');
const UUID = require('uuid');
const Boom = require('boom');
const uaParser = require('ua-parser-js');
const Base32 = require('base32-crockford-browser');


const buildUrl = require('../../lib/buildUrl');
const fetchICE = require('../../lib/fetchIce');
const inflateDomains = require('../../lib/domains');
const checkLicense = require('../../lib/licensing');
const extractCustomerData = require('../../lib/customerData');

const TalkyCoreConfig = require('getconfig').talky;
const Domains = inflateDomains(TalkyCoreConfig.domains);


module.exports = {
  description: 'Auto-configure a registered user client session',
  tags: ['api'],
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
      console.error('Could not fetch ICE servers');   
    }

    let customerData = {};
    try {
      customerData = extractCustomerData(request.payload.token);
    } catch (err) {
      return reply(Boom.badRequest('Could not parse user data'));
    }

    const { ua, browser, device, os } = uaParser(request.headers['user-agent']);

    const sessionId = UUID.v4();
    const userId = `${Base32.encode(JSON.stringify({
      id: customerData.id,
      scopes: customerData.scopes || []
    }))}@${Domains.users}`;

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
      console.log(err);
    }

    return reply({
      sessionId,
      userId,
      signalingUrl: `${buildUrl('ws', Domains.api)}/ws-bind`,
      telemetryUrl: `${buildUrl('http', Domains.api)}/telemetry`,
      roomServer: Domains.rooms,
      iceServers: ice,
      displayName: customerData.displayName || '',
      credential: JWT.sign({
        sessionId,
        registeredUser: true
      }, Config.auth.secret, {
        algorithm: 'HS256',
        expiresIn: '1 day',
        issuer: Domains.api,
        audience: Domains.guests,
        subject: userId
      })
    });
  },
  validate: {
    payload: {
      token: Joi.string()
    }
  }
};
