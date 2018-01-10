'use strict';

const Duration = require('humanize-duration');
const Boom = require('boom');

module.exports = {
  description: 'Dashboard',
  tags: ['web', 'metrics'],
  auth: 'admin',
  handler: async function (request, h) {

    const { id } = request.params;

    const room = await this.db.rooms.findOne({ id });

    if (!room) {
      throw Boom.notFound();
    }

    const [similarPrev, similarNext] = await Promise.all([
      this.db.rooms.get_similar_prev({
        name: room.name,
        interval: 5,
        created_at: room.created_at,
        ended_at: room.ended_at
      }),
      this.db.rooms.get_similar_next({
        name: room.name,
        interval: 5,
        created_at: room.created_at,
        ended_at: room.ended_at
      })
    ]);

    for (const roomData of [room, similarPrev, similarNext]) {
      if (!roomData) {
        continue;
      }

      roomData.duration = Duration((roomData.ended_at || new Date()).getTime() - roomData.created_at.getTime());

      if (roomData === room) {
        continue;
      }
      if (roomData.ended_at) {
        if (roomData.ended_at.getTime() < room.created_at.getTime()) {
          roomData.delta = Duration(room.created_at.getTime() - roomData.ended_at.getTime());
        }
        else if (roomData.created_at.getTime() > room.ended_at.getTime()) {
          roomData.delta = Duration(roomData.created_at.getTime() - room.ended_at.getTime());
        }
      }
    }

    const shortSessions = {};
    if (room.reports) {
      let counter = 1;
      for (const occupant of room.reports.occupants.occupants) {
        shortSessions[occupant.session] = `#${counter}`;
        counter++;
      }
    }

    const reportReady = !!room.reports;

    const summary = [];
    summary.push(['Room ID', id]);
    summary.push(['Room Name', room.name]);
    summary.push(['Room Duration', room.duration]);
    if (room.reports) {
      const report = room.reports;
      summary.push(['Active Call Duration', Duration(report.occupants.usableCallTime)]);
      summary.push(['Total Talk Time', Duration(report.speakingTimes.totalTime)]);
      summary.push(['Initial Waiting Time', Duration(report.occupants.initialWaitingTime)]);
      summary.push(['Largest Room Size', report.occupants.maxConcurrent]);
      summary.push(['Total Occupants Joined', report.occupants.totalJoined]);

      for (const occupant of report.occupants.occupants) {
        occupant.duration = Duration(occupant.duration);
      }

      for (const speaker of report.speakingTimes.speakers) {
        speaker.duration = Duration(speaker.duration);
      }

      for (const session of report.jingle) {
        session.duration = Duration(session.duration);
      }
    }

    return h.view('single_room', {
      resource: id,
      room,
      summary,
      report: room.reports,
      reportReady,
      shortSessions,
      similarPrev,
      similarNext
    });
  }
};
