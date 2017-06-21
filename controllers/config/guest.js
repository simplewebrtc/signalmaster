'use strict';

const Config = require('getconfig');
const Joi = require('joi');
const JWT = require('jsonwebtoken');
const UUID = require('uuid');
const uaParser = require('ua-parser-js');

const buildUrl = require('../../lib/buildUrl');
const fetchICE = require('../../lib/fetchIce');
const inflateDomains = require('../../lib/domains');

const TalkyCoreConfig = require('getconfig').talky;
const Domains = inflateDomains(TalkyCoreConfig.domains);


module.exports = {
  description: 'Auto-configure a registered user client session',
  tags: ['api'],
  handler: function (request, reply) {

    const userId = UUID.v4();
    const jid = `${userId}@${Domains.guests}`;
    const { ua, browser, device, os } = uaParser(request.headers['user-agent'])

    return fetchICE().then(ice => {

      return reply({
        sessionId: userId,
        userId: jid,
        signalingUrl: `${buildUrl('ws', Domains.api)}/ws-bind`,
        telemetryUrl: `${buildUrl('http', Domains.api)}/telemetry`,
        roomServer: Domains.rooms,
        iceServers: ice,
        credential: JWT.sign({
          jid,
          sessionId: userId,
          registeredUser: false
        }, Config.auth.secret, {
          algorithm: 'HS256',
          expiresIn: '1 day',
          issuer: Domains.api,
          audience: Domains.guests,
          subject: userId
        })
      });
    })
    .then(() => {
      return this.db.users.insert({
        sessionid: userId,
        userid: jid,
        type: device.type === undefined ? 'desktop' : 'mobile',
        os: JSON.stringify(os),
        useragent: ua,
        browser: JSON.stringify(browser)
      })
    })
    .catch(err => console.log(err));
  }
};

