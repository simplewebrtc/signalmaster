'use strict';

// Update with your config settings.
const Config = require('getconfig');

module.exports = {

  development: {
    client: 'postgresql',
    connection: Config.db
  },

  staging: {
    client: 'postgresql',
    connection: Config.db,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: Config.db,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  migrate: {
    client: 'postgresql',
    connection: Config.db
  }

};
