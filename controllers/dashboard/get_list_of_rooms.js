'use strict';

const Joi = require('joi');
const Duration = require('humanize-duration');


module.exports = {
  description: 'Dashboard',
  tags: ['web', 'metrics'],
  auth: 'admin',
  handler: async function (request, h) {

    const params = { ...request.query };
    const limit = params.limit;
    params.offset = (params.page - 1) * limit;

    const count = await this.db.rooms.count(params);
    request.totalCount = count.count;

    const rooms = await this.db.rooms.reported(params);
    const pagesArr = new Array(Math.ceil(request.totalCount / limit)).fill(0);

    for (const room of rooms) {
      const end = (room.ended_at || new Date(Date.now())).getTime();
      const start = room.created_at.getTime();

      room.duration = Duration(end - start);
      room.initialWaitingTime = room.reports.occupants.initialWaitingTime ? Duration(room.reports.occupants.initialWaitingTime) : '-';
      room.usableCallTime = room.reports.occupants.usableCallTime ? Duration(room.reports.occupants.usableCallTime) : '-';
    }
    rooms.sort((a, b) => {

      return a.created_at > b.created_at ? -1 : a.created_at < b.created_at ? 1 : 0;
    });

    return h.view('list_of_rooms', {
      pages: pagesArr,
      data: rooms
    });
  },
  validate: {
    query: {
      limit: Joi.number().default(25).min(1).max(100),
      page: Joi.number().positive().default(1)
    }
  }
};
