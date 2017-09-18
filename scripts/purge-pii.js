'use strict';

const Config = require('getconfig');
const Muckraker = require('muckraker');

const db = new Muckraker({ connection: Config.db });


const purge = async (interval = 7) => {

  try {
    await db.events.purge_pii({ now: new Date(), interval });
  }
  catch (err) {
    console.error(err);
  }

  db.end();
};

if (require.main === module) {
  const ParseArgs = require('minimist');
  const opts = ParseArgs(process.argv.slice(2));

  purge(parseInt(opts.interval || '7', 10));
}

