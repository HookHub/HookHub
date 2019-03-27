#!/bin/bash

cd "$(dirname $0)/../"

while [ true ]; do
  ## Cleanup first
  scripts/devreset.sh
  ## Install missing modules
  echo 'Installing missing modules...'
  npm install
  ## Run the devtest environment
  echo 'Running devtest environment...'
  docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --remove-orphans --quiet-pull --build
done
