const fs = require('fs');
var Exec = require('child_process').exec

fs.readFile('/etc/prosody/prosody.cfg.lua', 'utf8', function(err, data) {
	if (err) {
		return console.log(err);
	}

	var prosodyConfig = data.toString().replace(/\"/g, '\'').replace(/\n/g, '\\n');
	var configMapTemplate = `{ \n "apiVersion": "v1", \n "kind": "ConfigMap", \n "metadata": { \n "name": "prosody-config",\n"namespace": "default"\n},\n"data": {\n"prosody.cfg.lua": "${prosodyConfig}"\n	  }\n	}`;
	fs.writeFile('./cm-prosody-config.json', configMapTemplate, (err) => {
		if (err) throw err;
		console.log('Config Written');
		var postConfigMap = Exec('/bin/sh /app/scripts/post-prosody-config.sh', function(err, stdout, stderr) {
			if (err) console.log(err);
			process.stdout.write(stdout);
			process.stderr.write(stderr);
		});
	});
});