var express = require('express');
var sockets = require('./sockets');
var expressApp = express();

var server = expressApp.listen(8888);

sockets(server, {
    "logLevel": 3,
    "rooms": {
        "maxClients": 0 /* maximum number of clients per room. 0 = no limit */
    },
    "stunservers": [{
        "url": "stun:stun.l.google.com:19302"
    }],
    "turnservers" : [
        /*
        { "url": "turn:your.turn.server.here",
          "secret": "turnserversharedsecret",
          "expiry": 86400 }
          */
    ]

});
