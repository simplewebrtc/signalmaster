'use strict';

exports.up = function (knex, Promise) {

  return knex.raw('create index concurrently "rooms_name_index" on "rooms" ("name")');
};

exports.down = function (knex, Promise) {

  return knex.schema.alterTable('rooms', (table) => {

    table.dropIndex('name');
  });
};

exports.config = { transaction: false };
