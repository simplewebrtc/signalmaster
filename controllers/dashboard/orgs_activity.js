'use strict';
const Joi = require('joi');

module.exports = {
  description: 'Activity by Organization',
  tags: ['web', 'metrics'],
  auth: 'admin',
  handler: async function (request, h) {


    const createOrgRecord = () => ({
      config_request_count: 0,
      used_turn_count: 0,
      session_connected_count: 0,
      web_count: 0,
      mobile_count: 0
    });

    const totalStats = {
      active: createOrgRecord(),
      one_day: createOrgRecord(),
      week: createOrgRecord()
    };
    const perCustomerStats = new Map();

    const categorize = (org, data, field) => {

      totalStats[field].config_request_count += data.config_request_count;
      totalStats[field].used_turn_count += data.used_turn_count;
      totalStats[field].session_connected_count += data.session_connected_count;
      totalStats[field].web_count += data.web_count;
      totalStats[field].mobile_count += data.mobile_count;

      let orgStats = perCustomerStats.get(org);
      if (!orgStats) {
        orgStats = {
          id: org,
          active: createOrgRecord(),
          one_day: createOrgRecord(),
          week: createOrgRecord(),
          last_activity: undefined
        };
        perCustomerStats.set(org, orgStats);
      }

      orgStats[field].config_request_count += data.config_request_count;
      orgStats[field].used_turn_count += data.used_turn_count;
      orgStats[field].session_connected_count += data.session_connected_count;
      orgStats[field].web_count += data.web_count;
      orgStats[field].mobile_count += data.mobile_count;

      if (data.last_activity && data.last_activity > orgStats.last_activity) {
        orgStats.last_activity = data.last_activity;
      }
    };

    const activity = await this.db.sessions.per_customer_stats();
    for (const data of activity) {
      if (data.live) {
        categorize(data.org_id, data, 'active');
      }
      if (data.one_day) {
        categorize(data.org_id, data, 'one_day');
      }
      categorize(data.org_id, data, 'week');
    }

    return h.view('orgs_activity', {
      totalStats,
      perCustomerStats: [...perCustomerStats.values()]
    });
  },
  validate: {
    query: {
      limit: Joi.number().default(25).min(1).max(100),
      page: Joi.number().positive().default(1)
    }
  }

};
