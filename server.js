/*global console*/
var yetify = require('yetify'),
    config = require('getconfig'),
    fs = require('fs'),
    sockets = require('./sockets'),
    port = parseInt(process.env.PORT || config.server.port, 10),
    host = process.env.HOST || config.server.host,
    le_domain = process.env.DOMAIN || false,
    server_handler = function (req, res) {
        res.writeHead(404);
        res.end();
    },
    server = null;

// Create an http(s) server instance to that socket.io can listen to
if (config.server.secure) {
  var fileExists = function (fp) {
    try { fs.accessSync(fp); return true } catch (err) { return false; }
  }
  if (le_domain) {
    var le_path = "/etc/letsencrypt/live/" + le_domain + "/";
    if (fileExists(le_path + "privkey.pem")) {
      config.server.key = le_path + "privkey.pem"
    }
    if (fileExists((le_path + "cert.pem"))) {
      config.server.cert = le_path + "cert.pem"
    }
  }
    server = require('https').Server({
        key: fs.readFileSync(config.server.key),
        cert: fs.readFileSync(config.server.cert),
        passphrase: config.server.password
    }, server_handler);
} else {
    server = require('http').Server(server_handler);
}
server.listen(port);

sockets(server, config);

if (config.uid) process.setuid(config.uid);

var httpUrl;
if (config.server.secure) {
    httpUrl = "https://" + host + ":" + port;
} else {
    httpUrl = "http://" + host + ":" + port;
}
console.log(yetify.logo() + ' -- signal master is running at: ' + httpUrl);
