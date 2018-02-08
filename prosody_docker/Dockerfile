FROM prosody/prosody:trunk

MAINTAINER Heather Young heather@andyet.net

USER root


RUN apt-get update
RUN apt-get install -y --no-install-recommends \
    dnsutils net-tools

ADD prosody_modules /etc/prosody_modules
ADD certs.key /etc/prosody_certs/certs.key
ADD certs.pem /etc/prosody_certs/certs.pem
RUN chown -R prosody:prosody /etc/prosody_modules \
 && chown -R prosody:prosody /etc/prosody_certs \
 && chown -R prosody:prosody /etc/prosody

USER prosody

CMD ["prosody"]
