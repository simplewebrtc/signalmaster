'use strict';

const Hapi = require('hapi');
const Muckraker = require('muckraker');
const Config = require('getconfig');
const Redis = require(Config.redis.module);
const Proxy = require('http-proxy');
const FS = require('fs');

const InflateDomains = require('./lib/domains');
const BuildUrl = require('./lib/build_url');
const ResetDB = require('./lib/reset_db');
const Domains = InflateDomains(Config.talky.domains);

const InternalAuth = require('./lib/internal_auth');
const ProsodyAuth = require('./lib/prosody_auth');

const EventWorker = require('./lib/event_worker');
const RoomReports = require('./lib/room_reports_worker');

const Pkg = require('./package.json');

//$lab:coverage:off$
if (Config.getconfig.env !== 'production') {
  if (FS.existsSync('config/key.pem') && FS.existsSync('config/cert.pem')) {
    const key = FS.readFileSync('config/key.pem');
    const cert = FS.readFileSync('config/cert.pem');
    Config.server.tls = { key, cert };
  }
}
//$lab:coverage:on$

const server = new Hapi.Server(Config.server);
const db = new Muckraker({ connection: Config.db });
const redisClient = Redis.createClient(Config.redis.connection);
const eventWorker = new EventWorker({ db, redis: redisClient });
const roomReports = new RoomReports({ db, redis: redisClient });


server.events.on({ name: 'request', channels: ['error'] }, (request, event) => {

  console.log(event.stack || event);
});

const wsPort = Config.getconfig.isDev ? (Config.isDevTLS ? 5281 : 5280) : 5281;
const wsProxy = Proxy.createProxyServer({ target: `${BuildUrl('ws', Domains.signaling, wsPort)}` });
wsProxy.on('error', (err) => {

  server.log(err, 'Prosody not responding');
});

//$lab:coverage:on$

exports.db = db;
exports.redis = redisClient;
exports.eventWorker = eventWorker;
exports.roomReports = roomReports;

exports.Server = server.register(require('hapi-auth-basic')).then(() => {

  server.auth.strategy('admin', 'basic', {
    validate: (request, username, password, h) => {

      const admins = Config.talky.admins || {};
      const isValid = (admins[username] === password);
      return { isValid, credentials: {} };
    }
  });
}).then(async () => {

  await server.register([{
    plugin: require('good'),
    options: Config.good
  }, {
    plugin: require('@now-ims/hapi-now-auth')
  }, {
    plugin: require('vision')
  }, {
    plugin: require('inert')
  }, {
    plugin: require('hapi-swagger'),
    options: {
      auth: 'admin',
      grouping: 'tags',
      info: {
        title: Pkg.description,
        version: Pkg.version,
        contact: {
          name: '&yet',
          email: 'talky@andyet.com'
        },
        license: {
          name: Pkg.license
        }
      }
    }
  }, {
    plugin: require('./lib/jwt_authorization')
  }]);
}).then(async () => {

  await ResetDB(db, redisClient);

  server.auth.strategy('prosody-guests', 'basic', {
    validate: ProsodyAuth('guests')
  });

  server.auth.strategy('prosody-users', 'basic', {
    validate: ProsodyAuth('users')
  });

  server.auth.strategy('prosody-bots', 'basic', {
    validate: ProsodyAuth('bots')
  });

  server.auth.strategy('internal-api', 'basic', {
    validate: InternalAuth
  });

  server.auth.strategy('client-token', 'hapi-now-auth', {
    verifyJWT: true,
    keychain: [Config.auth.secret],
    verifyOptions: {
      algorithms: ['HS256'],
      issuer: [Domains.api]
    },
    validate: (request, token, h) => {

      const decoded = token.decodedJWT;
      return { isValid: true, credentials: decoded };
    }
  });

  server.views({
    engines: { pug: require('pug') },
    path: `${__dirname}/views`,
    isCached: !Config.getconfig.isDev
  });

  // $lab:coverage:off$
  server.listener.on('upgrade', (req, socket, head) => {

    wsProxy.ws(req, socket, head);
  });

  if (Config.getconfig.isDev && !Config.noProsody) {
    const prosody = require('./scripts/start-prosody').startProsody(process);
    prosody.stdout.pipe(process.stdout);
  }
  // $lab:coverage:on$

  server.bind({ db, redis: redisClient });
  server.route(require('./routes'));
}).then(async () => {

  // coverage disabled because module.parent is always defined in tests
  // $lab:coverage:off$
  if (module.parent) {
    await server.initialize();
    return server;
  }

  eventWorker.start();
  roomReports.start();
  await server.start();
  server.log(['info', 'startup'], server.info.uri);
}).catch((err) => {

  // coverage disabled due to difficulty in faking a throw
  // $lab:coverage:off$
  console.error(err.stack || err);
  process.exit(1);
  // $lab:coverage:on$
});

// $lab:coverage:off$
process.on('unhandledException', (err) => {

  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {

  console.error(err.stack);
  process.exit(1);
});
// $lab:coverage:on$

// $lab:coverage:off$
process.on('SIGTERM', async () => {

  server.log(['info', 'shutdown'], 'Graceful shutdown');
  await server.stop({ timeout: 15000 });
  await eventWorker.stop();
  await roomReports.stop();
  process.exit(0);
});
// $lab:coverage:on$
