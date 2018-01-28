import socketIO from 'socket.io';
import uuid from 'uuid/v1';
import crypto from 'crypto';

function sockets(server, config) {
  const safeCb = cb => (typeof cb === 'function' ? cb : () => {});
  const io = socketIO(server);
  io.on('connection', (client) => {
    client.resources = {
      screen: false,
      video: true,
      audio: false
    };
    // pass a message to another id
    client.on('message', (details) => {
      if (!details) return;

      const otherClient = io.to(details.to);
      if (!otherClient) return;

      details.from = client.id;
      otherClient.emit('message', details);
    });

    client.on('shareScreen', () => {
      client.resources.screen = true;
    });

    function removeFeed(type) {
      if (client.room) {
        io.sockets.in(client.room).emit('remove', {
          id: client.id,
          type
        });
        if (!type) {
          client.leave(client.room);
          client.room = undefined;
        }
      }
    }

    function clientsInRoom(name) {
      const room = io.sockets.adapter.rooms[name];
      if (room) {
        return Object.keys(room).length;
      }
      return undefined;
    }

    function describeRoom(name) {
      const { adapter } = io.nsps['/'];
      const clients = adapter.rooms[name] || {};
      const result = {
        clients: {}
      };
      Object.keys(clients).forEach((id) => {
        result.clients[id] = adapter.nsp.connected[id].resources;
      });
      return result;
    }

    function join(name, cb) {
      // sanity check
      if (typeof name !== 'string') return;
      // check if maximum number of clients reached
      if (
        config.rooms &&
        config.rooms.maxClients > 0 &&
        clientsInRoom(name) >= config.rooms.maxClients
      ) {
        safeCb(cb)('full');
        return;
      }
      // leave any existing rooms
      removeFeed();
      safeCb(cb)(null, describeRoom(name));
      client.join(name);
      client.room = name;
    }

    client.on('unshareScreen', () => {
      client.resources.screen = false;
      removeFeed('screen');
    });

    client.on('join', join);

    // we don't want to pass "leave" directly because the
    // event type string of "socket end" gets passed too.
    client.on('disconnect', () => {
      removeFeed();
    });
    client.on('leave', () => {
      removeFeed();
    });

    client.on('create', function create(name, cb) {
      if (arguments.length === 2) {
        cb = typeof cb === 'function' ? cb : () => {};
        name = name || uuid();
      } else {
        cb = name;
        name = uuid();
      }
      // check if exists
      const room = io.nsps['/'].adapter.rooms[name];
      if (room && room.length) {
        safeCb(cb)('taken');
      } else {
        join(name);
        safeCb(cb)(null, name);
      }
    });

    // support for logging full webrtc traces to stdout
    // useful for large-scale error monitoring
    client.on('trace', (data) => {
      console.log(
        'trace',
        JSON.stringify([data.type, data.session, data.prefix, data.peer, data.time, data.value])
      );
    });

    // tell client about stun and turn servers and generate nonces
    client.emit('stunservers', config.stunservers || []);

    // create shared secret nonces for TURN authentication
    // the process is described in draft-uberti-behave-turn-rest
    const credentials = [];
    // allow selectively vending turn credentials based on origin.
    const { origin } = client.handshake.headers;
    if (!config.turnorigins || config.turnorigins.indexOf(origin) !== -1) {
      config.turnservers.forEach((ts) => {
        const hmac = crypto.createHmac('sha1', ts.secret);
        // default to 86400 seconds timeout unless specified
        const username = `${Math.floor(new Date().getTime() / 1000) +
          parseInt(ts.expiry || 86400, 10)}`;
        hmac.update(username);
        credentials.push({
          username,
          credential: hmac.digest('base64'),
          urls: ts.urls || ts.url
        });
      });
    }
    client.emit('turnservers', credentials);
  });
}

export default sockets;
