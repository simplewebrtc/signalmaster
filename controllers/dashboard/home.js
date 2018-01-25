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
    const iceClock = await redis_get('ice_events_clock') || '-';
    const iceSent = await redis_hgetall('ice_usage_by_server_sent');
    const iceRecv = await redis_hgetall('ice_usage_by_server_recv');
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
        sent: iceSent[iceServer] || 0,
        received: iceRecv[iceServer] || 0
      });
    }

    const activeCount = await this.db.rooms.count_active();
    const sessionCount = await this.db.sessions.count_active();
    const sessionMobileCount = await this.db.sessions.count_active_type({ session_type: 'mobile' });
    const sessionDesktopCount = await this.db.sessions.count_active_type({ session_type: 'desktop' });

    const sessionDayCount = await this.db.sessions.count_period({
      ts: new Date(),
      interval: '1 day'
    });
    const sessionWeekCount = await this.db.sessions.count_period({
      ts: new Date(),
      interval: '7 days'
    });

    const sessionMobileDayCount = await this.db.sessions.count_period_type({
      ts: new Date(),
      interval: '1 day',
      session_type: 'mobile'
    });
    const sessionMobileWeekCount = await this.db.sessions.count_period_type({
      ts: new Date(),
      interval: '7 days',
      session_type: 'mobile'
    });

    const sessionDesktopDayCount = await this.db.sessions.count_period_type({
      ts: new Date(),
      interval: '1 day',
      session_type: 'desktop'
    });
    const sessionDesktopWeekCount = await this.db.sessions.count_period_type({
      ts: new Date(),
      interval: '7 days',
      session_type: 'desktop'
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
      activeRoomCount: activeCount.count,
      activeSessionCount: sessionCount.count,
      activeMobileSessionCount: sessionMobileCount.count,
      activeDesktopSessionCount: sessionDesktopCount.count,
      prevDayRoomCount: roomDayCount.count,
      prevWeekRoomCount: roomWeekCount.count,
      prevDaySessionCount: sessionDayCount.count,
      prevWeekSessionCount: sessionWeekCount.count,
      prevDayUniqueRoomCount: roomUniqueDayCount.count,
      prevWeekUniqueRoomCount: roomUniqueWeekCount.count,
      prevDayMobileSessionCount: sessionMobileDayCount.count,
      prevWeekMobileSessionCount: sessionMobileWeekCount.count,
      prevDayDesktopSessionCount: sessionDesktopDayCount.count,
      prevWeekDesktopSessionCount: sessionDesktopWeekCount.count
    });
  },
  validate: {
    query: {
      limit: Joi.number().default(25).min(1).max(100),
      page: Joi.number().positive().default(1)
    }
  }
};
