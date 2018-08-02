'use strict';

const Child = require('child_process');


const startHost = function startHost() {

  return Child.spawn('prosody');
};

exports.startProsody = function (parentProcess) {

  const prosody = startHost();

  if (parentProcess) {
    const shutdown = (signal) => {

      prosody.on('close', () => {

        parentProcess.stdout.write('\n\n');
        if (signal === 'SIGINT') {
          parentProcess.exit();
        }
        else {
          parentProcess.kill(parentProcess.pid, signal);
        }
      });

      prosody.kill('SIGINT');
    };

    parentProcess.on('SIGINT', () => shutdown('SIGINT'));
    parentProcess.once('SIGUSR2', () => shutdown('SIGUSR2'));
  }

  return prosody;
};

if (require.main === module) {
  const prosody = exports.startProsody(process);
  prosody.stdout.pipe(process.stdout);
}
