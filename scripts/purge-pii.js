'use strict';

const Config = require('getconfig');
const Muckraker = require('muckraker');

const db = new Muckraker(Config.db);


const purge = async (interval = '7 days') => {

  const opts = { now: new Date(), interval };

  try {
    const eventPurge = db.events.purge(opts);
    const sessionPurge = db.sessions.purge(opts);
    const roomPurge = db.rooms.purge(opts);

    await Promise.all([eventPurge, sessionPurge, roomPurge]);
  }
  catch (err) {
    console.error(err);
  }

  db.end();
};

if (require.main === module) {
  const ParseArgs = require('minimist');
  const opts = ParseArgs(process.argv.slice(2));

  purge(opts.interval);
}

