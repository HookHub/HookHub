#!/bin/sh

BASEDIR=`dirname $0 | awk '{ print $0 "/.." }'`

cd "$BASEDIR"

echo "Installing Node modules"
npm install --production

find modules/* -maxdepth 1 | while read MODULE_DIR
do
    echo "Installing Node modules for $MODULE_DIR"
    ( cd "$MODULE_DIR" ; npm install --production )
done