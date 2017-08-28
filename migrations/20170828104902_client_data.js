'use strict';

exports.up = async function (knex, Promise) {

  await knex.schema.table('events', (table) => {

    table.json('data').nullable();
  });
};

exports.down = async function (knex, Promise) {

  await knex.schema.table('events', (table) => {

    table.dropColumn('data');
  });
};
