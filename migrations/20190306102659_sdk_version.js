'use strict';

exports.up = async function (knex, Promise) {

  await knex.schema.table('sessions', (table) => {

    table.string('sdk_version');
  });
};

exports.down = async function (knex, Promise) {

  await knex.schema.table('sessions', (table) => {

    table.dropColumn('sdk_version');
  });
};
