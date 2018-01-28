import tape from 'tape';
import config from 'getconfig';
import io from 'socket.io-client';

const test = tape.createHarness();

const output = test.createStream();
output.pipe(process.stdout);
output.on('end', () => {
  console.log('Tests complete, killing server.');
  process.exit(0);
});

let socketURL;
if (config.server.secure) {
  socketURL = `https://localhost:${config.server.port}`;
} else {
  socketURL = `http://localhost:${config.server.port}`;
}

const socketOptions = {
  transports: ['websocket'],
  'force new connection': true,
  secure: config.server.secure
};

test('it should not crash when sent an empty message', (t) => {
  t.plan(1);
  const client = io.connect(socketURL, socketOptions);

  client.on('connect', () => {
    client.emit('message');
    t.ok(true);
  });
});
