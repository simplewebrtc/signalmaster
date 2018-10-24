FROM prosody/prosody:trunk

MAINTAINER Heather Young heather@andyet.net

USER root

RUN apt-get update \
    && rm -rf /var/lib/apt/lists/*

ADD prosody_modules /etc/prosody_modules
RUN chown -R prosody:prosody /etc/prosody_modules \
 && chown -R prosody:prosody /etc/prosody

USER prosody

CMD ["prosody"]
