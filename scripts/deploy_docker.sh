#!/bin/bash

cd "$(dirname "$(realpath "$0")")/../" || exit

TEMPLATE=local/hookhub
NAME=hookhub

# Clean up node_modules directories
###find "$BASEDIR" -type d -name node_modules -exec rm {} \;

docker build -t $TEMPLATE .

echo "Killing old instance (if any)"
docker kill $NAME
echo "Removing old instance (if any)"
docker rm $NAME
echo "Starting"
docker run -d \
    --init \
    --restart=always \
    --name $NAME \
    -e VIRTUAL_HOST=hookhub.vanhack.ca \
    -e LETSENCRYPT_HOST=hookhub.vanhack.ca \
    -e DEBUG=* \
    -p 3000:3000 \
    -t $TEMPLATE \
    bin/www
