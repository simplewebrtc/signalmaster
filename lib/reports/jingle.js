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
        const session = this.sessions.get(event.data.sid) || {};
        session.sid = event.data.sid;
        session.initiator = event.data.isInitiator ? event.actor_id : event.peer_id;
        session.responder = event.data.isInitiator ? event.peer_id : event.actor_id;
        session.start = new Date(event.created_at);
        this.sessions.set(event.data.sid, session);
        break;
      }

      case 'peer_session_removed': {
        const session = this.sessions.get(event.data.sid) || {};
        session.ended = new Date(event.created_at);
        session.duration = session.ended - session.start;
        this.sessions.set(event.data.sid, session);
        break;
      }

      case 'occupant_left': {
        for (const session of this.sessions.values()) {
          if (session.initiator === event.actor_id || session.responder === event.actor_id) {
            if (!session.ended) {
              session.ended = new Date(event.created_at);
              session.duration = session.ended - session.start;
            }
          }
        }
        break;
      }

      case 'room_destroyed': {
        for (const session of this.sessions.values()) {
          if (!session.ended) {
            session.ended = new Date(event.created_at);
            session.duration = session.ended - session.start;
          }
        }
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

      case 'peer_session_stats': {
        const session = this.sessions.get(event.data.sid) || {};
        switch (event.data.name) {
          case 'ice-connected': {
            session.connectionTime = event.data.connectTime;
            session.hadLocalRelayCandidate = event.data.hadLocalRelayCandidate;
            session.hadRemoteRelayCandidate = event.data.hadRemoteRelayCandidate;

            if (event.data.initiator === event.actor_id) {
              session.localCandidateType = event.data.localCandidateType;
              session.remoteCandidateType = event.data.remoteCandidateType;
            }
            else {
              session.localCandidateType = event.data.remoteCandidateType;
              session.remoteCandidateType = event.data.localCandidateType;
            }

            session.turnType = event.data.turnType;
            break;
          }

          case 'ice-failed': {
            session.failedTime = event.data.failTime;
            session.numLocalHostCandidates = event.data.numLocalHostCandidates;
            session.numLocalSrflxCandidates = event.data.numLocalSrflxCandidates;
            session.numLocalRelayCandidates = event.data.numLocalRelayCandidates;
            session.numRemoteRelayCandidates = event.data.numRemoteRelayCandidates;
            session.numRemoteSrflxCandidates = event.data.numRemoteSrflxCandidates;
            session.numRemoteRelayCandidates = event.data.numRemoteRelayCandidates;
            break;
          }
        }

        this.sessions.set(event.data.sid, session);
        break;
      }
    }
  }

  results() {

    const sessions = [];
    const candidateTypes = new Set();

    for (const session of this.sessions.values()) {
      sessions.push(session);
      if (session.localCandidateType) {
        candidateTypes.add(session.localCandidateType);
      }
      if (session.remoteCandidateType) {
        candidateTypes.add(session.remoteCandidateType);
      }
    }

    return {
      sessions,
      failedSessions: [...this.failedSessions],
      interruptedSessions: [...this.interruptedSessions],
      candidateTypes: [...candidateTypes]
    };
  }
}


module.exports = Jingle;

