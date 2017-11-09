'use strict';


class MaxConcurrentSessionsCounter {

  constructor() {

    this.occupants = new Set();
    this.maxSize = 0;
  }

  update(event) {

    switch (event.type) {
      case 'occupant_joined': {
        this.occupants.add(event.actor_id);
        break;
      }
      case 'occupant_left': {
        this.occupants.delete(event.actor_id);
        break;
      }
    }

    this.maxSize = Math.max(this.maxSize, this.occupants.size);
  }

  results() {

    return this.maxSize;
  }
}


module.exports = MaxConcurrentSessionsCounter;

