'use strict';

exports.up = async function (knex, Promise) {

  await knex.schema.table('rooms', (table) => {

    table.dropColumn('jid');
  });
};

exports.down = async function (knex, Promise) {

  await knex.schema.table('rooms', (table) => {

    table.text('jid');
  });
};

