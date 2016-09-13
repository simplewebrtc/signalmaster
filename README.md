# signalmaster

A simple signaling server for clients to connect and do signaling for WebRTC.

Specifically created as a default connection point for [SimpleWebRTC.js](https://github.com/HenrikJoreteg/SimpleWebRTC)

It also supports vending STUN/TURN servers with the shared secret mechanism as described in [this draft](http://tools.ietf.org/html/draft-uberti-behave-turn-rest-00).  This mechanism is implemented e.g. by [rfc-5766-turn-server](https://code.google.com/p/rfc5766-turn-server/) or by a [patched version](https://github.com/otalk/restund) of [restund](http://creytiv.com/restund.html).

Read more:
 - [Introducing SimpleWebRTC and conversat.io](http://blog.andyet.com/2013/02/22/introducing-simplewebrtcjs-and-conversatio/)
 - [SimpleWebRTC.com](http://simplewebrtc.com)
 - [talky.io](https://talky.io)

## Running

Running the server requires a valid installation of node.js which can be installed from the nodejs.org website. After installing the package you will need to install the node dependencies.

1) npm install

2) run the server using "node server.js"

3) In the console you will see a message which tells you where the server is running:

                        "signal master is running at: http://localhost:8888"

4) Open a web browser to the specified URL and port to ensure that the server is running properly. You should see the message when you go to the /socket.io/ subfolder (e.g. http://localhost:8888/socket.io/), you should see a message like this:

						{"code":0,"message":"Transport unknown"}

### Production Environment
* generate your ssl certs

```shell
$ ./scripts/generate-ssl-certs.sh
```
* run in Production mode

```shell
$ NODE_ENV=production node server.js
```

## Use with Express
    var express = require('express')
    var sockets = require('signalmaster/sockets')

    var app = express()
    var server = app.listen(port)
    sockets(server, config) // config is the same that server.js uses

## Docker

You can build this image by calling:  

    docker build -t signalmaster https://github.com/andyet/signalmaster.git

To run the image execute this:  

    docker run --name signalmaster -d -p 8888:8888 signalmaster

This will start a signal master server on port 8888 exposed on port 8888.
