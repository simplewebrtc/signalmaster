var crypto = require('crypto');
var config = require('getconfig');
module.exports = {
    getIceServers: function (client, cb) {
        try {
            // create shared secret nonces for TURN authentication
            // the process is described in draft-uberti-behave-turn-rest
            var credentials = [];
            // allow selectively vending turn credentials based on origin.
            var origin = client.handshake.headers.origin;

            if (!config.turnorigins || config.turnorigins.indexOf(origin) !== -1) {
                config.turnservers.forEach(function (server) {
                    var hmac = crypto.createHmac('sha1', server.secret);
                    // default to 86400 seconds timeout unless specified
                    var username = Math.floor(new Date().getTime() / 1000) + (parseInt(server.expiry || 86400, 10)) + "";
                    hmac.update(username);
                    credentials.push({
                        username: username,
                        credential: hmac.digest('base64'),
                        urls: server.urls || server.url
                    });
                });
            }
            cb(null, {turnservers: credentials, stunservers: config.stunservers || []});
        } catch (e) {
            cb(e, {});
        }
    }

};