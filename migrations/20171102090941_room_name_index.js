'use strict';

exports.up = function (knex, Promise) {

  return knex.schema.alterTable('rooms', (table) => {

    table.index('name');
  });
};

exports.down = function (knex, Promise) {

  return knex.schema.alterTable('rooms', (table) => {

    table.dropIndex('name');
  });
};
