'use strict';


class MaxConcurrentSessionsCounter {

  constructor() {

    this.occupants = new Set();
    this.max_size = 0;
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
 
    this.max_size = Math.max(this.max_size, this.occupants.size);
  }

  results() {

    return this.max_size;
  }
}


module.exports = MaxConcurrentSessionsCounter;

