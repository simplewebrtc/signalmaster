exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function (table) {
    table.bigIncrements();
    table.text('type');
    table.text('sessionid').unique();
    table.text('userid');
    table.text('os');
    table.text('browser');
    table.text('useragent')
    table.timestamps();
  })
  .then(() => {
    return knex.schema.createTable('rooms', (table) => {
      table.bigIncrements();
      table.text('roomid').unique();
      table.text('name');
      table.text('jid');
      table.timestamps();
    })
  })
  .then(() => {
    return knex.schema.createTable('events', (table) => {
      table.bigIncrements();
      table.text('type');
      table.timestamps();
    })
  })
  .then(() => {
    return knex.schema.table('events', (table) => {
      // Some events will be just about a room, some room/user interaction, some user/user interaction
      table.text('room_id').references('roomid').inTable('rooms').onDelete('CASCADE')
      table.text('actor_id').references('sessionid').inTable('users').onDelete('CASCADE')
      table.text('peer_id').references('sessionid').inTable('users').onDelete('CASCADE')
    })
  })
  .then(() => {
    return knex.schema.table('users', (table) => {
      table.integer('room_id').unsigned().references('id').inTable('rooms').onDelete('CASCADE')
    })
  })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('events')
  .then(() => {
    return knex.schema.dropTableIfExists('users')
  })
  .then(() => {
    return knex.schema.dropTableIfExists('rooms')
  })
};
