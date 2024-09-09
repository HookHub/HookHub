#!/bin/bash

cd /app || exit

if [ ! -d node_modules ]; then
    scripts/bootstrap.sh --prod
fi

exec "$@"
