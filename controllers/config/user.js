'use strict';

const Config = require('getconfig');
const Joi = require('joi');
const JWT = require('jsonwebtoken');
const UUID = require('uuid');
const uaParser = require('ua-parser-js');
const base32 = require('base32-crockford-browser');


const buildUrl = require('../../lib/buildUrl');
const fetchICE = require('../../lib/fetchIce');
const inflateDomains = require('../../lib/domains');

const TalkyCoreConfig = require('getconfig').talky;
const Domains = inflateDomains(TalkyCoreConfig.domains);


module.exports = {
  description: 'Auto-configure a registered user client session',
  tags: ['api'],
  handler: function (request, reply) {

    JWT.verify(request.payload.token, TalkyCoreConfig.apiKey, { algorithm: 'HS256' }, (err, customerData) => {
      
      if (err) {
        return reply({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid token'
        }).code(400);
      }

      const { ua, browser, device, os } = uaParser(request.headers['user-agent']);

      const sessionId = UUID.v4();
      const userId = `${base32.encode(JSON.stringify({
        id: customerData.id,
        scopes: customerData.scopes || []
      }))}@${Domains.users}`;

      return fetchICE().then(ice => {

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
            registeredUser: false
          }, Config.auth.secret, {
            algorithm: 'HS256',
            expiresIn: '1 day',
            issuer: Domains.api,
            audience: Domains.guests,
            subject: userId
          })
        });
      }).then(() => {

        return this.db.users.insert({
          sessionid: sessionId,
          userid: userId,
          type: device.type === undefined ? 'desktop' : 'mobile',
          os: JSON.stringify(os),
          useragent: ua,
          browser: JSON.stringify(browser)
        })
      }).catch(err => console.log(err));
    });
  },
  validate: {
    payload: {
      token: Joi.string()
    }
  }
};

