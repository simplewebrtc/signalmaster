'use strict';

exports.up = function (knex, Promise) {

  return knex.schema.alterTable('events', (table) => {

    table.dropForeign('room_id');
    table.dropForeign('actor_id');
    table.dropForeign('peer_id');
  });

};

exports.down = function (knex, Promise) {

  return knex.schema.alterTable('events', (table) => {

    table.text('room_id').references('id').inTable('rooms').onDelete('CASCADE').alter();
    table.text('actor_id').references('id').inTable('sessions').onDelete('CASCADE').alter();
    table.text('peer_id').references('id').inTable('sessions').onDelete('CASCADE').alter();
  });
};
