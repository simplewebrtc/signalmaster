'use strict';

module.exports = {
  description: 'Dashboard',
  tags: ['api', 'metrics'],
  handler: function (request, reply) {
    const { roomId } = request.params
    const { similar } = request.query
    console.log(request.query);
    if(similar) {
      this.db.rooms.findOne({ roomid: roomId })
      .then((room) => {
        const { lt, gt } = request.query;
        return this.db.rooms.get_similar({
          name: room.name,
          lt,
          gt,
          ts: room.created_at
        })
      })
      .then((similarRooms) => {
        console.log(similarRooms);
        reply.view('listOfRooms', { data: similarRooms })
      })
    } else {
      this.db.events.find({ room_id: roomId })
      .then((events) => {
        return reply.view('singleRoom', { resource: roomId, data: events });
      })
    }
  }
};
