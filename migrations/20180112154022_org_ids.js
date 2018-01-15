'use strict';

exports.up = async function (knex, Promise) {

  await knex.schema.alterTable('sessions', (table) => {

    table.string('org_id');
  });

  await knex.schema.alterTable('rooms', (table) => {

    table.string('org_id');
  });
};

exports.down = async function (knex, Promise) {

  await knex.schema.alterTable('sessions', (table) => {

    table.dropColumn('org_id');
  });

  await knex.schema.alterTable('rooms', (table) => {

    table.dropColumn('org_id');
  });
};
