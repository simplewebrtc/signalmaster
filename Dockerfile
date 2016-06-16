FROM node:4-onbuild

COPY ./config /usr/src/app
ENV NODE_ENV production

# "key": "/etc/letsencrypt/live/runfullstack.co/privkey.pem",
# "cert": "/etc/letsencrypt/live/runfullstack.co/cert.pem",
ARG DOMAIN=runfullstack.com

RUN sed -i -e "s/config\/sslcerts\/key.pem/\/etc\/letsencrypt\/live\/$DOMAIN\/privkey.pem/g" /usr/src/app/config/production.json && \
    sed -i -e "s/config\/sslcerts\/cert.pem/\/etc\/letsencrypt\/live\/$DOMAIN\/cert.pem/g" /usr/src/app/config/production.json
