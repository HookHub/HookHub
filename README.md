# hookhub
An Express container aimed at providing modular web hook endpoints

## Installation

### Development
```
npm install
npm run dev
```

### Docker

#### Local Docker builds
```
scripts/deploy_docker.sh
```

## Configuration

HookHub itself does not require any configuration.

## Hooks

Hooks can be installed into the `hooks` directory, from which they will automatically be loaded on startup.

Individual _hooks_ may require configuration, which should always be localized to the _hook_ directory.