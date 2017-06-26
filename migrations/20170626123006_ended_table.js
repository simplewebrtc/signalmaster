
exports.up = function(knex, Promise) {
  return knex.schema.table('rooms', (table) => {
    table.timestamp('ended_at')
  })
  .then(() => {
    return knex.schema.table('users', (table) => {
      table.timestamp('ended_at')
    })
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('rooms', (table) => {
    table.dropColumn('ended_at')
  })
  .then(() => {
    return knex.schema.table('users', (table) => {
      table.dropColumn('ended_at')
    })
  })
};
