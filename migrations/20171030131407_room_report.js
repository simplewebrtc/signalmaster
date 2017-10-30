'use strict';
exports.up = function (knex, Promise) {

  return knex.schema.alterTable('rooms', (table) => {

    table.jsonb('reports');
  });
};

exports.down = function (knex, Promise) {

  return knex.schema.alterTable('rooms', (table) => {

    table.dropColumn('reports');
  });
};
