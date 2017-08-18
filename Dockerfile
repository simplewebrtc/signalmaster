FROM node:4-onbuild
ARG DOMAIN=runfullstack.co

COPY ./config /usr/src/app
ENV NODE_ENV production

RUN sed -i -e "s/config\/sslcerts\/key.pem/\/etc\/letsencrypt\/live\/$DOMAIN\/privkey.pem/g" /usr/src/app/config/production.json && \
    sed -i -e "s/config\/sslcerts\/cert.pem/\/etc\/letsencrypt\/live\/$DOMAIN\/cert.pem/g" /usr/src/app/config/production.json

RUN apt-get update -yq && \
    apt-get install -yq supervisor && \
    mkdir -p /var/log/supervisor

COPY ./supervisord.conf /etc/supervisor/conf.d/signalmaster.conf

CMD ["/usr/bin/supervisord"]
