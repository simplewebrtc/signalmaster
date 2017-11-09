'use strict';


class SpeakingTimes {

  constructor() {

    this.totalOccupants = new Set();
    this.currentOccupants = new Map();
    this.occupantCounts = new Map();
    this.occupantTimeTotals = new Map();

    this.maxRoomSize = 0;
    this.initialWaitingTime = 0;
    this.usableCallTime = 0;
    this.usableCallTimeStart = null;
    this.roomCreatedTime = null;
  }

  update(event) {

    switch (event.type) {
      case 'room_created': {
        this.roomCreatedTime = new Date(event.created_at);
        break;
      }

      case 'occupant_joined': {
        this.totalOccupants.add(event.actor_id);

        const existing = this.currentOccupants.get(event.actor_id) || {};
        if (!existing.start) {
          existing.start = new Date(event.created_at);
          const currentCount = this.occupantCounts.get(event.actor_id) || 0;
          this.occupantCounts.set(event.actor_id, currentCount + 1);
        }
        this.currentOccupants.set(event.actor_id, existing);

        if (this.currentOccupants.size >= 2 && !this.usableCallTimeStart) {
          this.usableCallTimeStart = new Date(event.created_at);
          this.initialWaitingTime = this.usableCallTimeStart - this.roomCreatedTime;
        }
        break;
      }

      case 'occupant_left': {
        this.totalOccupants.add(event.actor_id);

        const existing = this.currentOccupants.get(event.actor_id) || {};
        if (existing.start) {
          const duration = new Date(event.created_at) - existing.start;
          const currentTotal = this.occupantTimeTotals.get(event.actor_id) || 0;
          this.occupantTimeTotals.set(event.actor_id, currentTotal + duration);
        }
        this.currentOccupants.delete(event.actor_id);
        break;
      }

      case 'room_destroyed': {
        for (const [occupant, interval] of this.currentOccupants) {
          if (interval.start) {
            const duration = new Date(event.created_at) - interval.start;
            const currentTotal = this.occupantTimeTotals.get(occupant) || 0;
            this.occupantTimeTotals.set(occupant, currentTotal + duration);
          }
        }
        this.currentOccupants.clear();
        break;
      }
    }

    this.maxRoomSize = Math.max(this.maxRoomSize, this.currentOccupants.size);
    if (this.currentOccupants.size < 2) {
      if (this.usableCallTimeStart) {
        this.usableCallTime += new Date(event.created_at) - this.usableCallTimeStart;
        this.usableCallTimeStart = null;
      }
    }
  }

  results() {

    const occupants = [];
    for (const [occupant, count] of this.occupantCounts) {
      const duration = this.occupantTimeTotals.get(occupant) || 0;
      occupants.push({
        session: occupant,
        count,
        duration
      });
    }

    return {
      totalJoined: this.totalOccupants.size,
      maxConcurrent: this.maxRoomSize,
      usableCallTime: this.usableCallTime,
      initialWaitingTime: this.initialWaitingTime,
      occupants
    };
  }
}


module.exports = SpeakingTimes;

