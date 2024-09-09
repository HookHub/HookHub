#!/bin/sh

cd "$(dirname "$(realpath "$0")")/../" || exit

echo "Installing Node modules"
npm install --omit=dev

find hooks/* -maxdepth 0 -type d | while read -r HOOK_DIR
do
    echo "Installing Node modules for $HOOK_DIR"
    ( cd "$HOOK_DIR" || exit ; npm install --omit=dev )
done
