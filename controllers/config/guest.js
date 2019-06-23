'use strict';

const Config = require('getconfig');
const Joi = require('joi');
const JWT = require('jsonwebtoken');
const UUID = require('uuid');
const Boom = require('@hapi/boom');
const UAParser = require('ua-parser-js');
const Schema = require('../../lib/schema');
const { promisify } = require('util');

const BuildUrl = require('../../lib/build_url');
const FetchICE = require('../../lib/fetch_ice');
const Domains = require('../../lib/domains');
const LookupOrg = require('../../lib/lookup_org');

module.exports = {
  description: 'Auto-configure a registered user client session',
  tags: ['api', 'config'],
  handler: async function (request, h) {

    const org = await LookupOrg({ orgId: request.params.orgId, redis: this.redis });
    if (!org) {
      return Boom.forbidden('Account not enabled');
    }

    const { ua, browser, os } = UAParser(request.headers['user-agent']);

    const id = UUID.v4();
    const org_id = org.key;
    const user_id = `${org_id}#${id}@${Domains.guests}`;
    const ice = FetchICE({ org_id, session_id: id });
    const sdkVersion = request.payload.clientVersion;

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
      signalingUrl: `${BuildUrl({ proto: 'ws', domain: Domains.signaling, overridePort })}/ws-bind`,
      telemetryUrl: `${BuildUrl({ proto: 'http', domain: Domains.api })}/telemetry`,
      roomConfigUrl: `${BuildUrl({ proto: 'http', domain: Domains.api })}/config/room`,
      roomServer: Domains.rooms,
      iceServers: ice,
      displayName: '',
      apiVersion: Config.talky.apiVersion,
      credential: JWT.sign({
        id,
        orgId: org_id,
        registeredUser: false,
        sdkVersion
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
    },
    payload: Joi.object({
      clientVersion: Joi.string().optional().default('').description('Client SDK version').example('1.7.3')
    }).empty(null).default({
      clientVersion: ''
    }).unknown()
  },
  response: {
    status: {
      200: Schema.guest
    }
  }
};
