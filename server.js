'use strict';

const Hapi = require('hapi');
const Muckraker = require('muckraker');
const Config = require('getconfig');
const Proxy = require('http-proxy');
const FS = require('fs');

const InflateDomains = require('./lib/domains');
const BuildUrl = require('./lib/build_url');
const Domains = InflateDomains(Config.talky.domains);
const ProsodyAuth = require('./lib/prosody_auth');
const ResetDB = require('./lib/reset_db');

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

const server = new Hapi.Server();
const db = new Muckraker({ connection: Config.db });
server.connection(Config.server);

//$lab:coverage:off$
process.on('sigterm', async () => {

  server.log(['info', 'shutdown'], 'graceful shutdown');

  await server.stop({ timeout: 15000 });
  await ResetDB(db, 'system_stop');

  process.exit(0);
});

server.on('request-error', (err, m) => {

  console.log(m.stack);
});

const wsPort = Config.getconfig.isDev ? (Config.isDevTLS ? 5281 : 5280) : 5281;
const wsProxy = Proxy.createProxyServer({ target: `${BuildUrl('ws', Domains.signaling, wsPort)}` });
wsProxy.on('error', (err) => {

  server.log(err, 'Prosody not responding');
});

//$lab:coverage:on$

exports.db = db;
exports.Server = server.register([
  {
    register: require('good'),
    options: Config.good
  },
  {
    register: require('hapi-auth-basic')
  },
  {
    register: require('hapi-auth-jwt2')
  },
  {
    register: require('vision')
  },
  {
    register: require('inert')
  },
  {
    register: require('hapi-swagger'),
    options: {
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
  }
])
  .then(() => {

    return ResetDB(db, 'system_start');
  })
  .then(() => {

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
        algorithms: ['HS256'],
        issuer: Domains.api
      }
    });

    server.auth.strategy('admin', 'basic', {
      validateFunc: (request, username, password, cb) => {

        const admins = Config.talky.admins || {};
        return cb(null, admins[username] === password, {});
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

    server.bind({ db });
    server.route(require('./routes'));
  }).then(() => {

    // coverage disabled because module.parent is always defined in tests
    // $lab:coverage:off$
    if (module.parent) {
      return server.initialize().then(() => {

        return server;
      });
    }

    return server.start().then(() => {

      server.connections.forEach((connection) => {

        server.log(['info', 'startup'], `${connection.info.uri} ${connection.settings.labels}`);
      });
    });
    // $lab:coverage:on$
  }).catch((err) => {

    // coverage disabled due to difficulty in faking a throw
    // $lab:coverage:off$
    console.error(err.stack || err);
    process.exit(1);
    // $lab:coverage:on$
  });

// $lab:coverage:off$
process.on('unhandledException', function () {

  console.log(arguments);
  process.exit();
});

process.on('unhandledRejection', function () {

  console.log(arguments);
  process.exit();
});
// $lab:coverage:on$
