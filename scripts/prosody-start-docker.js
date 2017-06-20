'use strict';

const Child = require('child_process');


const configDir = __dirname + '/../config';
const moduleDir = __dirname + '/../prosody_modules';


exports.startProsody = function(parentProcess) {
  const prosody = Child.spawn('docker', [
      'run',
      '-p', '5222:5222',
      '-p', '5269:5269',
      '-p', '5280:5280',
      '-v', `${configDir}:/etc/prosody`,
      '-v', `${moduleDir}:/usr/lib/prosody-modules`,
      'prosody/prosody:trunk'
  ]);
  
  if (parentProcess) { 
    const shutdown = (signal) => () => {
      prosody.on('close', () => {
        parentProcess.stdout.write('\n\n');
        if (signal === 'SIGINT') {
          parentProcess.exit();
        } else {
          parentProcess.kill(parentProcess.pid, signal);
        }
      });

      prosody.kill('SIGINT');
    };

    parentProcess.on('SIGINT', shutdown('SIGINT'));
    parentProcess.once('SIGUSR2', shutdown('SIGUSR2'));
  }

  return prosody;
};


if (require.main === module) {
  const prosody = exports.startProsody(process);
  prosody.stdout.pipe(process.stdout);
}

