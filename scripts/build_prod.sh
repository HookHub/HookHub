#!/bin/sh

BASEDIR=`dirname $0 | awk '{ print $0 "/.." }'`

cd "$BASEDIR"

echo "Installing Node modules"
npm install --production

find hooks/* -maxdepth 1 -type d | while read HOOK_DIR
do
    echo "Installing Node modules for $HOOK_DIR"
    ( cd "$HOOK_DIR" ; npm install --production )
done
