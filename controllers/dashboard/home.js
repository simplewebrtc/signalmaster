'use strict';
const Joi = require('joi');
const { promisify } = require('util');

module.exports = {
  description: 'Dashboard',
  tags: ['web', 'metrics'],
  auth: 'admin',
  handler: async function (request, h) {

    const params = Object.assign({}, request.query);
    const limit = params.limit;
    params.offset = (params.page - 1) * limit;

    const redis_llen = promisify(this.redis.llen.bind(this.redis));
    const redis_get = promisify(this.redis.get.bind(this.redis));
    const redis_lindex = promisify(this.redis.lindex.bind(this.redis));
    const redis_hgetall = promisify(this.redis.hgetall.bind(this.redis));

    const eventQueue = await redis_llen('events');
    const roomReportQueue = await redis_llen('rooms_destroyed');
    let eventClock = await redis_get('events_clock');
    if (eventClock) {
      eventClock = new Date(Number(eventClock));
    }
    const nextReport = await redis_lindex('rooms_destroyed', 0);
    let roomReportClock = '-';
    if (nextReport) {
      roomReportClock = new Date(JSON.parse(nextReport).created_at);
    }

    const iceQueue = await redis_llen('ice_events');
    let iceClock = await redis_get('ice_events_clock');
    if (iceClock) {
      iceClock = new Date(Number(iceClock));
    }
    const iceSent = await redis_hgetall('ice_usage_by_server_sent');
    const iceRecv = await redis_hgetall('ice_usage_by_server_recv');
    const iceCount = await redis_hgetall('ice_count_by_server');
    const iceServers = new Set();
    for (const iceServer of Object.keys(iceSent || {})) {
      iceServers.add(iceServer);
    }
    for (const iceServer of Object.keys(iceRecv || {})) {
      iceServers.add(iceServer);
    }
    const iceUsage = [];
    for (const iceServer of iceServers) {
      iceUsage.push({
        server: iceServer,
        sent: (iceSent || {})[iceServer] || 0,
        received: (iceRecv || {})[iceServer] || 0,
        count: (iceCount || {})[iceServer] || 0
      });
    }

    const iceOrgSent = await redis_hgetall('ice_usage_by_org_sent');
    const iceOrgRecv = await redis_hgetall('ice_usage_by_org_recv');
    const iceOrgCount = await redis_hgetall('ice_count_by_org');
    const iceOrgs = new Set();
    for (const iceOrg of Object.keys(iceOrgSent || {})) {
      iceOrgs.add(iceOrg);
    }
    for (const iceOrg of Object.keys(iceOrgRecv || {})) {
      iceOrgs.add(iceOrg);
    }
    const iceOrgUsage = [];
    for (const iceOrg of iceOrgs) {
      iceOrgUsage.push({
        org: iceOrg,
        sent: (iceOrgSent || {})[iceOrg] || 0,
        received: (iceOrgRecv || {})[iceOrg] || 0,
        count: (iceOrgCount || {})[iceOrg] || 0
      });
    }


    const activeCount = await this.db.rooms.count_active();
    const sessionCount = await this.db.sessions.count_active();
    const sessionMobileCount = await this.db.sessions.count_active_type({ session_type: 'mobile', activated: true });
    const sessionWebCount = await this.db.sessions.count_active_type({ session_type: 'desktop', activated: true });

    const sessionDayCount = await this.db.sessions.count_period({
      ts: new Date(),
      interval: '1 day',
      activated: true
    });
    const sessionWeekCount = await this.db.sessions.count_period({
      ts: new Date(),
      interval: '7 days',
      activated: true
    });

    const sessionMobileDayCount = await this.db.sessions.count_period_type({
      ts: new Date(),
      interval: '1 day',
      session_type: 'mobile',
      activated: true
    });
    const sessionMobileWeekCount = await this.db.sessions.count_period_type({
      ts: new Date(),
      interval: '7 days',
      session_type: 'mobile',
      activated: true
    });

    const sessionWebDayCount = await this.db.sessions.count_period_type({
      ts: new Date(),
      interval: '1 day',
      session_type: 'desktop',
      activated: true
    });
    const sessionWebWeekCount = await this.db.sessions.count_period_type({
      ts: new Date(),
      interval: '7 days',
      session_type: 'desktop',
      activated: true
    });

    const roomDayCount = await this.db.rooms.count_period({
      ts: new Date(),
      interval: '1 day'
    });
    const roomWeekCount = await this.db.rooms.count_period({
      ts: new Date(),
      interval: '7 days'
    });

    const roomUniqueDayCount = await this.db.rooms.count_period_unique({
      ts: new Date(),
      interval: '1 day'
    });
    const roomUniqueWeekCount = await this.db.rooms.count_period_unique({
      ts: new Date(),
      interval: '7 days'
    });


    return h.view('system_stats', {
      eventClock,
      roomReportClock,
      iceClock,
      eventQueue,
      roomReportQueue,
      iceQueue,
      iceUsage,
      iceOrgUsage,
      activeRoomCount: activeCount.count,
      activeSessionCount: sessionCount.count,
      activeMobileSessionCount: sessionMobileCount.count,
      activeWebSessionCount: sessionWebCount.count,
      prevDayRoomCount: roomDayCount.count,
      prevWeekRoomCount: roomWeekCount.count,
      prevDaySessionCount: sessionDayCount.count,
      prevWeekSessionCount: sessionWeekCount.count,
      prevDayUniqueRoomCount: roomUniqueDayCount.count,
      prevWeekUniqueRoomCount: roomUniqueWeekCount.count,
      prevDayMobileSessionCount: sessionMobileDayCount.count,
      prevWeekMobileSessionCount: sessionMobileWeekCount.count,
      prevDayWebSessionCount: sessionWebDayCount.count,
      prevWeekWebSessionCount: sessionWebWeekCount.count
    });
  },
  validate: {
    query: {
      limit: Joi.number().default(25).min(1).max(100),
      page: Joi.number().positive().default(1)
    }
  }
};
