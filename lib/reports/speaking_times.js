'use strict';


class SpeakingTimes {

  constructor() {

    this.speakerCounts = new Map();
    this.speakerInterrupts = new Map();
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

        if (this.activeSpeakers.size > 1) {
          const current = this.speakerInterrupts.get(event.actor_id);
          this.speakerInterrupts.set(event.actor_id, current + 1);
        }

        break;
      }

      case 'occupant_left':
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

      case 'room_destroyed': {
        for (const [speaker, interval] of this.activeSpeakers) {
          if (interval.start) {
            const duration = new Date(event.created_at) - interval.start;
            const currentTotal = this.speakerTotals.get(speaker) || 0;
            this.speakerTotals.set(speaker, currentTotal + duration);
            this.totalTime += duration;
          }
        }
        this.activeSpeakers.clear();
        break;
      }
    }
  }

  results() {

    const stats = [];
    for (const [speaker, count] of this.speakerCounts) {
      const duration = this.speakerTotals.get(speaker) || 0;
      const interrupts = this.speakerInterrupts.get(speaker) || 0;

      let percentage = 0;
      if (this.totalTime > 0) {
        percentage = (duration / this.totalTime) * 100;
      }

      stats.push({ speaker, count, interrupts, duration, percentage });
    }

    return {
      totalTime: this.totalTime,
      speakers: stats
    };
  }
}


module.exports = SpeakingTimes;

