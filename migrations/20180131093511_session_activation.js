'use strict';

exports.up = async function (knex, Promise) {

  await knex.schema.table('sessions', (table) => {

    table.boolean('activated').defaultTo(false);
  });
};

exports.down = async function (knex, Promise) {

  await knex.schema.table('sessions', (table) => {

    table.dropColumn('activated');
  });
};
