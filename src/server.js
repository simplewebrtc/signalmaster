import config from 'getconfig';
import fs from 'fs';
import sockets from './sockets';

const http = require('http');
const https = require('https');

const serverHandler = (req, res) => {
  res.writeHead(404);
  res.end();
};

const port = parseInt(process.env.PORT || config.server.port, 10);
const httpUrl = config.server.secure ? `https://localhost:${port}` : `http://localhost:${port}`;

let server;

// Create an http(s) server instance to that socket.io can listen to
if (config.server.secure) {
  server = https.Server({
    key: fs.readFileSync(config.server.key),
    cert: fs.readFileSync(config.server.cert),
    passphrase: config.server.password,
  }, serverHandler);
} else {
  server = http.Server(serverHandler);
}

server.listen(port);

sockets(server, config);

if (config.uid) {
  process.setuid(config.uid);
}

console.log(`signal master is running at: ${httpUrl}`);
