FROM node:alpine

MAINTAINER Heather Young heather@andyet.net

ENV NODE_ENV=production

ADD . /app
WORKDIR /app

RUN apk update \
 && apk upgrade \
 && apk add --no-cache wget \
 && npm i -q \
 && mkdir -p /etc/prosody \
 && chmod +x  ./scripts/post-prosody-config.sh



CMD ["npm", "start"]
