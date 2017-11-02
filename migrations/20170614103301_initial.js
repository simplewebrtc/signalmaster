'use strict';

exports.up = async function (knex, Promise) {

  await knex.raw('CREATE SEQUENCE rooms_seq');
  await knex.schema.createTable('rooms', (table) => {

    table.text('id').unique().index();
    table.bigint('seq').defaultTo(knex.raw('nextval(\'rooms_seq\')')).index(); //Used for pagination
    table.text('name').index();
    table.text('jid');
    table.timestamps();
  });
  await knex.raw('CREATE SEQUENCE sessions_seq');

  await knex.schema.createTable('sessions', (table) => {

    table.text('id').unique().index();
    table.bigint('seq').defaultTo(knex.raw('nextval(\'sessions_seq\')')).index(); //Used for pagination
    table.text('user_id');
    table.text('type');
    table.text('os');
    table.text('browser');
    table.text('useragent');
    table.text('room_id').unsigned().references('id').inTable('rooms').onDelete('CASCADE');
    table.timestamps();
  });

  await knex.schema.createTable('events', (table) => {

    table.bigIncrements();
    table.text('type');
    table.timestamps();
  });

  // Some events will be just about a room, some room/session interaction, some session/session interaction
  await knex.schema.table('events', (table) => {

    table.text('room_id').references('id').inTable('rooms').onDelete('CASCADE');
    table.text('actor_id').references('id').inTable('sessions').onDelete('CASCADE');
    table.text('peer_id').references('id').inTable('sessions').onDelete('CASCADE');
  });
};

exports.down = async function (knex, Promise) {

  await knex.schema.dropTableIfExists('events');
  await knex.schema.dropTableIfExists('sessions');
  await knex.schema.dropTableIfExists('rooms');
  await knex.raw('DROP SEQUENCE sessions_seq');
  await knex.raw('DROP SEQUENCE rooms_seq');
};
