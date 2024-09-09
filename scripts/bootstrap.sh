#!/bin/sh

cd "$(dirname "$(realpath "$0")")/../" || exit

NPM_INSTALL_OPTS="--omit=dev"

if [ "$1" = "--dev" ]; then
    NPM_INSTALL_OPTS=""
fi

echo "Installing Node modules"
npm install ${NPM_INSTALL_OPTS}

find hooks/* -maxdepth 0 -type d | while read -r HOOK_DIR; do
    echo "Installing Node modules for $HOOK_DIR"
    (
        cd "$HOOK_DIR" || exit
        npm install ${NPM_INSTALL_OPTS}
    )
done
