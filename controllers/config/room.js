'use strict';

const Config = require('getconfig');
const Joi = require('joi');

const Schema = require('../../lib/schema');
const InflateDomains = require('../../lib/domains');
const Domains = InflateDomains(Config.talky.domains);


module.exports = {
  description: 'Fetch configuration for a room',
  tags: ['api', 'config'],
  handler: function (request, h) {

    const session = request.auth.credentials;
    const orgId = session.orgId;

    const providedName = request.payload.name.toLowerCase();

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
    payload: {
      name: Joi.string().example('castle-of-lions')
    }
  },
  response: {
    status: {
      200: Schema.roomConfig
    }
  },
  auth: 'client-token'
};

