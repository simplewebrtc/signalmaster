'use strict';

const Joi = require('@hapi/joi');
const Boom = require('boom');
const Schema = require('../../lib/schema');
const Domains = require('../../lib/domains');
const LookupOrg = require('../../lib/lookup_org');


module.exports = {
  description: 'Fetch configuration for a room',
  tags: ['api', 'config'],
  handler: async function (request, h) {

    const session = request.auth.credentials;
    const orgId = session.orgId;

    const org = await LookupOrg({ orgId, redis: this.redis });
    if (!org) {
      return Boom.forbidden('Account not enabled');
    }

    const providedName = request.payload.name;

    // TODO: Drop compatibility for talky org once mobile app upgrades to use
    //       the SWRTC SDK with room configuration api
    if (orgId === 'talky') {
      return {
        roomAddress: `${providedName}@${Domains.rooms}`
      };
    }

    return {
      roomAddress: `${orgId}#${providedName}@${Domains.rooms}`
    };
  },
  validate: {
    payload: Joi.object({
      clientVersion: Joi.string().optional().description('Client SDK version').example('1.7.3'),
      name: Joi.string().lowercase().description('User provided name of a room').example('castle-of-lions')
    }).unknown()
  },
  response: {
    status: {
      200: Schema.roomConfig
    }
  },
  auth: 'client-token'
};

