#!/bin/bash

cd "$(dirname $0)/../"

## Cleanup first
echo 'Cleaning up...'
npm uninstall --save $(cat package.json | cut -f2 -d'"' | egrep hookhub | egrep -v doc)
docker-compose  -f docker-compose.yml -f docker-compose.dev.yml down --remove-orphans -v
