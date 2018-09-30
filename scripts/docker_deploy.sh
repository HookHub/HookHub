#!/bin/bash

BASEDIR=`dirname $0 | awk '{ print $0 "/.." }'`

cd "$BASEDIR"

TEMPLATE=local/hookhub
NAME=hookhub

# Clean up node_modules directories
find "$BASEDIR" -type d -name node_modules -exec rm {} \;

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
  -t $TEMPLATE \
  bin/www
