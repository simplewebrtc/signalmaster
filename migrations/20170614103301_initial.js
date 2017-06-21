exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function (table) {
    table.increments();
    table.enum('type', ['mobile', 'desktop']);
    table.string('sessionid').unique();
    table.string('userid').unique();
    table.string('os');
    table.string('browser');
    table.string('useragent')
    table.timestamps(true, true);
  })
  .then(() => {
    return knex.schema.createTable('rooms', (table) => {
      table.increments();
      table.string('roomid');
      table.string('name');
      table.string('jid');
      table.timestamps(true, true);
    })
  })
  .then(() => {
    return knex.schema.createTable('events', (table) => {
      table.increments();
      table.enum('type', [
        'room_created',
        'room_destroyed',
        'room_locked',
        'room_unlocked',
        'occupant_joined',
        'occupant_left',
        'message_sent',
        'screencapture_started',
        'screencapture_ended',
        'rtt_enabled',
        'rtt_disabled',
        'p2p_session_started',
        'p2p_session_ended',
        'p2p_session_stats',
        'video_paused',
        'video_resumed',
        'audio_paused',
        'audio_resumed'
      ]);
      table.timestamps(true, true);
    })
  })
  .then(() => {
    return knex.schema.table('events', (table) => {
      // Some events will be just about a room, some room/user interaction, some user/user interaction
      table.integer('room_id').unsigned().references('id').inTable('rooms').onDelete('CASCADE')
      table.integer('actor_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('peer_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
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
