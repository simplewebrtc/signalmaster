// Update with your config settings.
const config = require('getconfig');

module.exports = {

  development: {
    client: 'postgresql',
    connection: config.db
  },

  staging: {
    client: 'postgresql',
    connection: config.db,
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
    connection: config.db,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
