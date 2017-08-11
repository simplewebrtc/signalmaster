'use strict';

const FS = require('fs');
const Exec = require('child_process').exec;

FS.readFile('/etc/prosody/prosody.cfg.lua', 'utf8', (err, data) => {

  if (err) {
    return console.log(err);
  }

  const prosodyConfig = data.toString().replace(/\"/g, '\'').replace(/\n/g, '\\n');
  const configMapTemplate = `{ \n "apiVersion": "v1", \n "kind": "ConfigMap", \n "metadata": { \n "name": "prosody-config",\n"namespace": "default"\n},\n"data": {\n"prosody.cfg.lua": "${prosodyConfig}"\n     }\n   }`;

  FS.writeFile('./cm-prosody-config.json', configMapTemplate, (err) => {

    if (err) {
      throw err;
    }

    console.log('Config Written');
    Exec('/bin/sh /app/scripts/post-prosody-config.sh', (err, stdout, stderr) => {

      if (err) {
        console.log(err);
      }

      process.stdout.write(stdout);
      process.stderr.write(stderr);
    });
  });
});
