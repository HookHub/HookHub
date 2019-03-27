# hookhub
An Express container aimed at providing modular web hook endpoints

## Installation

### Development

```
npm run devtest
```

### Docker

```
git clone https://github.com/HookHub/hookhub-docker.git
cd hookhub-docker
```

#### Local bootstrap

To use a local bootstrap configuration, copy `hookhub-bootstrap-local.sample.yml` to `hookhub.yml` and edit the `hookhub.yml` file to your needs.

#### Remote/URL bootstrap
- Update the `docker-compose.yml` to use the [url based bootstrap module](https://github.com/hookhub/hookhub-bootstrap-local.git):
```
https://github.com/hookhub/hookhub-bootstrap-local.git
```
- Copy `hookhub-bootstrap-url.sample.yml` to `hookhub.yml` and configure as needed. The configuration is the YAML equivalent of the [request](https://www.npmjs.com/package/request) `options` object.

## Configuration

### Background

Hookhub is configuration source agnostic. This means that the bootstrap module acts as an intermediary between Hookhub and the actual configuration. See the Wiki page on configuration for more information.

### Overview

Hookhub hooks are comprised of `resources`, blocks of [express](http://expressjs.com/) middleware. Each block is configured by a resource definition, which is comprised of a `plugin`, optional `credential` and optional `options`. This allows re-use of `plugins` and `credentials`, and while `resources` can be re-used in different hooks, `options` are designed to allow users to use different configurations for `plugin`.

### Sections

#### Plugins

The plugins section connects plugins to [npm](https://docs.npmjs.com/) sources.

Example:
```
plugins:
  dump: "https://github.com/HookHub/hookhub-dump.git"
  ping: "https://github.com/HookHub/hookhub-ping.git"
  github-in: "https://github.com/hookhub/hookhub-github-webhook-in.git"
  slack-out: "https://github.com/hookhub/hookhub-slack-webhook-out.git"

```

For local module sources, the `bundle` directory is available and mounted into the container.

Example:
```
plugins:
  dump: "bundle/hookhub-dump.zip"
  ping: "bundle/hookhub-ping.zip"
  github-in: "bundle/hookhub-github-webhook-in.zip"
  slack-out: "bundle/hookhub-slack-webhook-out.zip"

```

#### Credentials

The credentials section provides the means to share credentials for services between different `resources` / `hooks`.

Example:
```
credentials:
  some-github-webhook:
    secret: SOMERANDOMSTRING
  company-slack:
    url: >-
      https://hooks.slack.com/services/PART1/PART2/PART3
```

#### Resources

Resources are the building blocks of Hookhub. Resources can be stacked to fullfill `hooks`, but to ensure configurability and re-use, they are configured as `resources`

Example:
```
resources:
  dump:
    plugin: dump
  ping:
    plugin: ping
  github-webhook1:
    plugin: github-in
    credential: some-github-webhook
  company-developer-slack:
    plugin: slack-out
    credential: company-slack
    options:
      username: HookHub
      icon_emoji: ":robot_face:"
      channel: "#developers"
```

In the example above, the `company-developer-slack` has a specific configuration. If the `#teamleads` channel would also need to receive information, the following example could be added:

```
resources:
  ...
  company-teamleads-slack:
    plugin: slack-out
    credential: company-slack
    options:
      username: HookHub
      icon_emoji: ":robot_face:"
      channel: "#teamleads"
```

#### Hooks

The `hooks` section connects the different endpoints to the `resources`.

In the example below, the `github-slack-devs` hooks connects the `github-webhook1` and the `company-developer-slack` `resources` to the `github-slack-devs` endpoint. This `hook` could then be configured on GitHub to notify the `company-developer-slack` channel of any or specific updates.

Example:
```
hooks:
  dump:
    - dump
  ping:
    - ping
  github-slack-devs:
    - github-webhook1
    - company-developer-slack
```

Using the second example in the `resources` section, we could extend this example configuration to this:

```
hooks:
  ...
  github-slack-devs:
    - github-webhook1
    - company-developer-slack
  github-slack-teamleads:
    - github-webhook1
    - company-teamleads-slack
```

It would also be possible to notify the `#devops` channel of new builds:

```
...
resources:
  ...
  company-devops-slack:
    plugin: slack-out
    credential: company-slack
    options:
      username: HookHub
      icon_emoji: ":robot_face:"
      channel: "#devops"
hooks:
  ...
  github-slack-devops:
    - github-webhook1
    - company-devops-slack
```

In this example, this `github-slack-devops` hook could be configured to only receive updates for releases or builds.