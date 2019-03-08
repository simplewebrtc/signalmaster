'use strict';

exports.up = async function (knex, Promise) {

  await knex.schema.table('sessions', (table) => {

    table.boolean('used_turn');
  });
};

exports.down = async function (knex, Promise) {

  await knex.schema.table('sessions', (table) => {

    table.dropColumn('used_turn');
  });
};
