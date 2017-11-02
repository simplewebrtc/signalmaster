'use strict';

const Config = require('getconfig');
const InflateDomains = require('../lib/domains');
const Domains = InflateDomains(Config.talky.domains);
const { promisify } = require('util');


module.exports = {
  description: 'API Homepage',
  tags: ['web'],
  handler: async function (request, reply) {

    const redis_llen = promisify(this.redis.llen.bind(this.redis));
    const eventQueue = await redis_llen('events');
    const roomReportQueue = await redis_llen('rooms_destroyed');
    reply.view('home', {
      eventQueue,
      roomReportQueue,
      domains: Domains,
      iceServer: Config.talky.ice.server,
      screensharingExtensions: Config.talky.screensharingExtensions || {}
    });
  }
};
