FROM node:8-alpine

MAINTAINER Heather Young heather@andyet.net

ENV NODE_ENV=production

ADD . /app
WORKDIR /app

RUN apk update \
 && apk upgrade \
 && apk add --no-cache wget \
 && npm i \
 && mkdir -p /etc/prosody \
 && chmod +x  ./scripts/post-prosody-config.sh



CMD ["npm", "start"]
