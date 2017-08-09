'use strict';

exports.up = function (knex, Promise) {

  return knex.raw('CREATE SEQUENCE users_seq')
    .then(() => {

      return knex.schema.createTable('users', (table) => {

        table.text('id').unique().index();
        table.bigint('seq').defaultTo(knex.raw('nextval(\'users_seq\')')).index(); //Used for pagination
        table.text('jid');
        table.text('type');
        table.text('os');
        table.text('browser');
        table.text('useragent');
        table.timestamps();
      });
    }).then(() => {

      return knex.raw('CREATE SEQUENCE rooms_seq');
    }).then(() => {

      return knex.schema.createTable('rooms', (table) => {

        table.text('id').unique().index();
        table.bigint('seq').defaultTo(knex.raw('nextval(\'rooms_seq\')')).index(); //Used for pagination
        table.text('name');
        table.text('jid');
        table.timestamps();
      });
    })
    .then(() => {

      return knex.schema.createTable('events', (table) => {

        table.bigIncrements();
        table.text('type');
        table.timestamps();
      });
    })
    .then(() => {

      // Some events will be just about a room, some room/user interaction, some user/user interaction
      return knex.schema.table('events', (table) => {

        table.text('room_id').references('id').inTable('rooms').onDelete('CASCADE');
        table.text('actor_id').references('id').inTable('users').onDelete('CASCADE');
        table.text('peer_id').references('id').inTable('users').onDelete('CASCADE');
      });
    })
    .then(() => {

      return knex.schema.table('users', (table) => {

        table.text('room_id').unsigned().references('id').inTable('rooms').onDelete('CASCADE');
      });
    });
};

exports.down = function (knex, Promise) {

  return knex.schema.dropTableIfExists('events')
    .then(() => {

      return knex.schema.dropTableIfExists('users');
    }).then(() => {

      return knex.schema.dropTableIfExists('rooms');
    }).then(() => {

      return knex.raw('DROP SEQUENCE users_seq');
    }).then(() => {

      return knex.raw('DROP SEQUENCE rooms_seq');
    });
};
