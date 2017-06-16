const Hapi = require('hapi');
const Muckraker = require('muckraker');
const config = require('getconfig');

const Routes = require('./routes');


const server = new Hapi.Server();
const db = new Muckraker({ connection: config.db })
server.connection(config.server)

server.start((err) => {
  if (err) throw err;

  console.log(`Server running at ${server.info.uri}`);
})

server.route(Routes);
