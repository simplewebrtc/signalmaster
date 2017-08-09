'use strict';

exports.up = async function (knex, Promise) {

  await knex.schema.table('rooms', (table) => {

    table.timestamp('ended_at');
  });
  await knex.schema.table('sessions', (table) => {

    table.timestamp('ended_at');
  });
};

exports.down = async function (knex, Promise) {

  await knex.schema.table('rooms', (table) => {

    table.dropColumn('ended_at');
  });

  await knex.schema.table('sessions', (table) => {

    table.dropColumn('ended_at');
  });
};
