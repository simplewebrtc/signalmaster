const Chance = require('chance');
const knexfile = require('./knexfile')
const knex = require('knex')(knexfile[process.env.NODE_ENV || 'development']);
const chance = new Chance();
const numberOfRooms = 10
const numberOfUsers = 40
const numberOfMessages = 100
const makeRoomsAndCreateEvents = () => {
  return Promise.all([
    knex('rooms').insert(new Array(numberOfRooms).fill(0).map(() => ({ name: `${chance.string()}@talky.io` }))),
    knex('events').insert(new Array(numberOfRooms).fill(0).map((e, i) => ({ type: 'created', room_id: i+1 })))
  ])
}

const makeUsers = () => {
  return knex('users').insert(
    new Array(numberOfUsers)
    .fill(0)
    .map(() => {
      return {
        type: chance.pickone(['desktop', 'mobile']),
        os: chance.pickone(['macos', 'windows', 'linux']),
        browser: chance.pickone(['chrome', 'firefox', 'opera', 'safari', 'edge']),
        useragent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3130.0 Safari/537.3',
        room_id: chance.integer({ min: 1, max: numberOfRooms })
      }
    })
  );
}

const makeConnectEvents = () => {
  return knex('users').where({})
  .then(users => {
    return knex('events').insert([
      ...users.map((u) => ({ type: 'connect', user_id: u.id, room_id: u.room_id })),
      ...users.map((u) => ({ type: 'disconnect', user_id: u.id, room_id: u.room_id }))
    ]);
  })
}

const makeMessageEvents = () => {
  return Promise.all(
    new Array(numberOfRooms).fill(0).map((u, i) => knex('users').where({ room_id: i+1 }))
  )
  .then((users) => {
    return Promise.all(
      users.map((roomArr) => {
        // Got kinda lazy here - only will return one message exchange per room - may change later if needed
        return roomArr.length > 1 ? knex('events').insert({ type: 'message', user_id: roomArr[0].id, user1_id: roomArr[1].id }) : null;
      })
    )
  })
}

makeRoomsAndCreateEvents()
.then(() => makeUsers())
.then(() => makeConnectEvents())
.then(() =>  makeMessageEvents())
.then(() => knex.destroy());