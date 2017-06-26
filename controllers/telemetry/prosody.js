'use strict';

const Config = require('getconfig');
const Crypto = require('crypto');
const Joi = require('joi');


module.exports = {
  description: 'Ingest metrics from Prosody',
  tags: ['api', 'metrics'],
  handler: function (request, reply) {
    const { eventType, data } = request.payload;
    let { roomId, name, sessionId, userId, jid } = data;

    if (name && Config.talky.metrics && Config.talky.metrics.maskRoomNames) {
      name = Crypto.createHash('sha1').update(name).digest('base64');
    }

    console.log(request.payload);
    if (roomId) {
      this.db.rooms.findOne({ roomid: roomId })
      .then((room) => {
        if (!room) return this.db.rooms.insert({ name, roomid: roomId, jid })
        else return room
      })
      .then((room) => {
        if(eventType === 'room_destroyed') {
          //Record room ended column
          return this.db.rooms.updateOne(room, { ended_at: new Date()})
            .then(() => this.db.events.insert({ type: eventType, room_id: room.roomid, actor_id: sessionId }))
        } else {
          //Record event
          return this.db.events.insert({ type: eventType, room_id: room.roomid, actor_id: sessionId })
        }
      })
      .then((insertedData) => reply(insertedData))
    } else {
      console.log(eventType, 'eveneteeeeeeeeeeeeeeeee');
      if (eventType === 'user_offline') {
        //Record user ended column
        console.log('in here with ', { sessionId });
        this.db.users.findOne({ sessionid: sessionId })
        .then((user) => {
          console.log(user);
          return this.db.users.updateOne(user, { ended_at: new Date()})
        })
        .then(() => this.db.events.insert({ type: eventType, room_id: null, actor_id: sessionId }))
        .then((insertedData) => reply(insertedData))
      } else {
        this.db.events.insert({ type: eventType, room_id: null, actor_id: sessionId })
        .then((insertedData) => reply(insertedData))
      }
    }

  },
  validate: {
    payload: {
      eventType: Joi.string(),
      data: Joi.object()
    }
  },
  auth: 'prosody-api'
};
