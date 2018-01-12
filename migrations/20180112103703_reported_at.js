'use strict';

exports.up = async function (knex, Promise) {

  await knex.schema.alterTable('rooms', (table) => {

    table.timestamp('reported_at');
  });
};

exports.down = async function (knex, Promise) {

  return knex.schema.alterTable('rooms', (table) => {

    table.dropColumn('reported_at');
  });
};

