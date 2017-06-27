#!/usr/bin/env bash

openssl genrsa -out privateKey.pem 4096
openssl rsa -in privateKey.pem -pubout -outform PEM -out publicKey.pem

