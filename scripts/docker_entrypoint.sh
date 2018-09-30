#!/bin/sh

cd /app

if [ ! -d node_modules ] ; then
    scripts/build_prod.sh
fi

exec "$@"