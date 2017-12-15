#! /bin/bash

docker build -f ./prosody_docker/Dockerfile -t andyet/prosody:api ./prosody_docker && \
docker push andyet/prosody:api