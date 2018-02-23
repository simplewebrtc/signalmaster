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

    return {
      roomAddress: `${request.payload.name.toLowerCase()}@${Domains.rooms}`
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

