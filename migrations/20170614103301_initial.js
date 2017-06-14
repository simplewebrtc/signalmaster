exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function (table) {
    table.increments();
    table.enum('type', ['mobile', 'desktop']);
    table.enum('os', ['macos', 'windows', 'linux']);
    table.enum('browser', ['chrome', 'firefox', 'opera', 'safari', 'edge'])
    table.string('useragent')
    table.timestamps(true, true);
  })
  .then(() => {
    return knex.schema.createTable('rooms', (table) => {
      table.increments();
      table.string('name');
      table.timestamps(true, true);
    })
  })
  .then(() => {
    return knex.schema.createTable('events', (table) => {
      table.increments();
      table.enum('type', ['connect', 'disconnect', 'message', 'created']);
      table.timestamps(true, true);
    })
  })
  .then(() => {
    return knex.schema.table('events', (table) => {
      // Some events will be just about a room, some room/user interaction, some user/user interaction
      table.integer('room_id').unsigned().references('id').inTable('rooms').onDelete('CASCADE')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('user1_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
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
