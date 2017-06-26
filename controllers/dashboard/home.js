'use strict';
const Joi = require('joi');

module.exports = {
  description: 'Dashboard',
  tags: ['api', 'metrics'],
  handler: function (request, reply) {
    const params = Object.assign({}, request.query);
    const limit = params.limit || 25;
    params.offset = ((params.page || 1) - 1) * limit;
    this.db.rooms.count(params).then((count) => {
      request.totalCount = count.count;
      return this.db.rooms.all(params)
    })
    .then((rooms) => {
      const pagesArr = new Array(Math.ceil(request.totalCount / limit)).fill(0)
      return reply.view('listOfRooms', { pages: pagesArr, data: rooms.reverse() });
    })
  },
  validate: {
    query: {
      limit: Joi.number().default(10).min(1).max(100),
      page: Joi.number().positive()
    }
  }
};