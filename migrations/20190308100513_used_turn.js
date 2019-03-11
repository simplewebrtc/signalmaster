'use strict';

exports.up = async function (knex, Promise) {

  await knex.schema.table('sessions', (table) => {

    table.boolean('used_turn');
    table.index('used_turn');
  });
};

exports.down = async function (knex, Promise) {

  await knex.schema.table('sessions', (table) => {

    table.dropIndex('used_turn');
    table.dropColumn('used_turn');
  });
};
