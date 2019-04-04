'use strict';
const Joi = require('joi');

module.exports = {
  description: 'Activity by Organization',
  tags: ['web', 'metrics'],
  auth: 'admin',
  handler: async function (request, h) {

    const activity = await this.db.orgs_activity();
    const day = await this.db.activity_summary({ interval: '1 days' });
    const week = await this.db.activity_summary({ interval: '7 days' });
    return h.view('orgs_activity', {
      day: day[0],
      week: week[0],
      activity
    });
  },
  validate: {
    query: {
      limit: Joi.number().default(25).min(1).max(100),
      page: Joi.number().positive().default(1)
    }
  }

};
