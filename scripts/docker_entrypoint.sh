#!/bin/bash -x

export DEBUG='hookhub:*'

cd /app

if [ "$HOOKHUB_BOOTSTRAP_MODULE" = "" ] ; then
    echo "Missing HOOKHUB_BOOTSTRAP_MODULE. Please configure HOOKHUB_BOOTSTRAP_MODULE."
    exit
fi

exec "$@"