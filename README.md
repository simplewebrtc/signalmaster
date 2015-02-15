# signalmaster

A simple signaling server for clients to connect and do signaling for WebRTC.

Specifically created as a default connection point for [SimpleWebRTC.js](https://github.com/HenrikJoreteg/SimpleWebRTC)

It also supports vending STUN/TURN servers with the shared secret mechanism as described in [this draft](http://tools.ietf.org/html/draft-uberti-behave-turn-rest-00).  This mechanism is implemented e.g. by [rfc-5766-turn-server](https://code.google.com/p/rfc5766-turn-server/) or by a [patched version](https://github.com/otalk/restund) of [restund](http://creytiv.com/restund.html).

Read more: 
 - [Introducing SimpleWebRTC and conversat.io](http://blog.andyet.com/2013/02/22/introducing-simplewebrtcjs-and-conversatio/)
 - [SimpleWebRTC.com](http://simplewebrtc.com)
 - [talky.io](https://talky.io)
