'use strict';


class TotalSessionsCounter {

  constructor() {

    this.occupants = new Set();
  }

  update(event) {

    switch (event.type) {
      case 'occupant_joined': {
        this.occupants.add(event.actor_id);
        break;
      }
      case 'occupant_left': {
        this.occupants.add(event.actor_id);
        break;
      }
    }
  }

  results() {

    return this.occupants.size;
  }
}


module.exports = TotalSessionsCounter;

