FROM node:4-onbuild

COPY ./config /usr/src/app
ENV NODE_ENV production
