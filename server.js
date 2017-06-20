const Hapi = require('hapi');
const Muckraker = require('muckraker');
const Config = require('getconfig');

const inflateDomains = require('./lib/domains');
const Domains = inflateDomains(Config.talky.domains);

const ProsodyAuth = require('./lib/prosodyAuth');

const Routes = require('./routes');


const server = new Hapi.Server();
const db = new Muckraker({ connection: Config.db });
server.connection(Config.server);


server.register([
  {
    register: require('good'),
    options: Config.good
  },
  {
    register: require('hapi-auth-basic')
  },
  {
    register: require('hapi-auth-jwt2')
  }
]).then(() => {

  server.auth.strategy('prosody-guests', 'basic', {
    validateFunc: ProsodyAuth('guests')
  });

  server.auth.strategy('prosody-users', 'basic', {
    validateFunc: ProsodyAuth('users')
  });

  server.auth.strategy('prosody-bots', 'basic', {
    validateFunc: ProsodyAuth('bots')
  });

  server.auth.strategy('prosody-api', 'basic', {
    validateFunc: ProsodyAuth('api')
  });

  server.auth.strategy('client-token', 'jwt', {
    key: Config.auth.secret,
    validateFunc: (decoded, request, cb) => cb(null, true),
    verifyOptions: {
      algorithms: [ 'HS256' ],
      issuer: Domains.api
    }
  });

  server.start((err) => {
    if (err) throw err;
  
    console.log(`Server running at ${server.info.uri}`);
  });
  
  server.route(Routes);
});
