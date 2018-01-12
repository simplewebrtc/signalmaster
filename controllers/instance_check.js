'use strict';

const Config = require('getconfig');
const InstanceCheck = require('../lib/instance_check');
const Schema = require('../lib/schema');

module.exports = {
  description: 'Used to verify if a domain is pointed against a specific Talky Core API instance. Are you there, me?',
  tags: ['api', 'instance-check'],
  handler: function (request, h) {

    return {
      instance: InstanceCheck.getInstanceID(),
      host: Config.talky.domains.api,
      service: 'api'
    };
  },
  response: {
    status: {
      200: Schema.instanceCheck
    }
  }
};

