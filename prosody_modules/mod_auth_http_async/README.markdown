---
labels:
- Stage-Alpha
...

Introduction
============

This is an experimental authentication module that does an asynchronous
HTTP call to verify username and password.

Details
=======

When a user attempts to authenticate to Prosody, this module takes the
username and password and does a HTTP GET request with [Basic
authentication][rfc7617] to the configured `http_auth_url`.

Configuration
=============

``` lua
VirtualHost "example.com"
authentication = "http_async"
http_auth_url = "http://example.com/auth"
```

Compatibility
=============

Requires Prosody trunk
