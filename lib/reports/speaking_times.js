'use strict';


class SpeakingTimes {

  constructor() {

    this.speakerCounts = new Map();
    this.speakerTotals = new Map();
    this.activeSpeakers = new Map();
    this.totalTime = 0;
  }

  update(event) {

    switch (event.type) {
      case 'started_speaking': {
        const currentCount = this.speakerCounts.get(event.actor_id) || 0;
        this.speakerCounts.set(event.actor_id, currentCount + 1);

        const currentInterval = this.activeSpeakers.get(event.actor_id) || {};
        currentInterval.start = new Date(event.created_at);
        this.activeSpeakers.set(event.actor_id, currentInterval);

        break;
      }

      case 'occupant_left':
      case 'room_destroyed':
      case 'stopped_speaking': {
        const interval = this.activeSpeakers.get(event.actor_id) || {};
        if (interval.start) {
          const duration = new Date(event.created_at) - interval.start;
          const currentTotal = this.speakerTotals.get(event.actor_id) || 0;
          this.speakerTotals.set(event.actor_id, currentTotal + duration);
          this.totalTime += duration;
        }
        this.activeSpeakers.delete(event.actor_id);

        break;
      }
    }
  }

  results() {

    const stats = [];
    for (const [speaker, count] of this.speakerCounts) {
      const duration = this.speakerTotals.get(speaker);
      let percentage = 0;

      if (this.totalTime > 0) {
        percentage = (duration / this.totalTime) * 100;
      }

      stats.push({ speaker, count, duration, percentage });
    }

    return {
      totalTime: this.totalTime,
      speakers: stats
    };
  }
}


module.exports = SpeakingTimes;

