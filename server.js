/*global console*/
var yetify = require('yetify'),
    config = require('getconfig'),
    io = require('socket.io').listen(config.server.port);

io.sockets.on('connection', function (client) {
    client.on('message', function (details) {
        var otherClient = io.sockets.sockets[details.to];

        if (!otherClient) {
            return;
        }
        delete details.to;
        details.from = client.id;
        otherClient.emit('message', details);
    });
});

if (config.uid) process.setuid(config.uid);
console.log(yetify.logo() + ' -- signal master is running at: http://localhost:' + config.server.port);
