'use strict';


class Jingle {

  constructor() {

    this.failedSessions = new Set();
    this.interruptedSessions = new Set();
    this.sessions = new Map();
  }

  update(event) {

    switch (event.type) {
      case 'peer_session_added': {
        this.sessions.set(event.data.sid, {
          sid: event.data.sid,
          initiator: event.actor_id,
          responder: event.peer_id,
          start: new Date(event.created_at)
        });
        break;
      }

      case 'peer_session_removed': {
        const session = this.sessions.get(event.data.sid) || {};
        session.ended = new Date(event.created_at);
        session.duration = session.ended - session.start;
        this.sessions.set(event.data.sid, session);
        break;
      }

      case 'peer_stream_added': {
        const session = this.sessions.get(event.data.sid) || {};
        session.audio = session.audio || event.data.audio;
        session.video = session.video || event.data.video;
        this.sessions.set(event.data.sid, session);
        break;
      }

      case 'peer_session_connection_state': {
        const session = this.sessions.get(event.data.sid) || {};
        session[event.data.connectionState] = true;
        this.sessions.set(event.data.sid, session);

        if (event.data.connectionState === 'failed') {
          this.failedSessions.add(event.data.sid);
        }
        if (event.data.connectionState === 'interrupted') {
          this.interruptedSessions.add(event.data.sid);
        }
        break;
      }
    }
  }

  results() {

    const sessions = [];
    for (const session of this.sessions.values()) {
      sessions.push(session);
    }

    return sessions;
  }
}


module.exports = Jingle;

