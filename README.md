# signalmaster

A simple signaling server for clients to connect and do signaling for WebRTC.

Specifically created as a default connection point for [SimpleWebRTC.js](https://github.com/HenrikJoreteg/SimpleWebRTC)

Read more: 
 - [Introducing SimpleWebRTC and conversat.io](http://blog.andyet.com/2013/feb/22/introducing-simplewebrtcjs-and-conversatio/)
 - [SimpleWebRTC.com](http://simplewebrtc.com)
 - [conversat.io](http://conversat.io)

Running:

Running the server requires a valid installation of node.js which can be installed from the nodejs.org website. After installing the package you will need to install the node dependencies.

1) npm install async, node-uuid, redis, underscore, precommit-hook, getconfig, yetify, socket.io

2) run the server using "node server.js"

3) In the console you will see a message which tells you where the server is running:

			"signal master is running at: http://localhost:8888"

4) Open a web browser to the specified URL and port to ensure that the server is running properly. You should see the message 

			"Welcome to socket.io"