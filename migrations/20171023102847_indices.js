'use strict';

exports.up = async function (knex, Promise) {

  await knex.schema.table('events', (table) => {

    table.index('actor_id');
    table.index('peer_id');
    table.index('room_id');
  });
};

exports.down = async function (knex, Promise) {

  await knex.schema.table('events', (table) => {

    table.dropIndex('actor_id');
    table.dropIndex('peer_id');
    table.dropIndex('room_id');
  });
};

