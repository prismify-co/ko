castle
======

A project scaffolding CLI for the web

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@prismify/castle.svg)](https://npmjs.org/package/@prismify/castle)
[![Downloads/week](https://img.shields.io/npm/dw/@prismify/castle.svg)](https://npmjs.org/package/castle)
[![License](https://img.shields.io/npm/l/@prismify/castle.svg)](https://github.com/https://github.com/prismify/castle.git/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @prismify/castle
$ castle COMMAND
running command...
$ castle (-v|--version|version)
@prismify/castle/1.0.0-alpha.1 darwin-x64 node-v13.0.1
$ castle --help [COMMAND]
USAGE
  $ castle COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`castle configure`](#castle-configure)
* [`castle create [NAME]`](#castle-create-name)
* [`castle help [COMMAND]`](#castle-help-command)
* [`castle init`](#castle-init)

## `castle configure`

configure the project using the configuration file

```
USAGE
  $ castle configure
```

_See code: [src/commands/configure.ts](https://github.com/prismify/castle/blob/v1.0.0-alpha.1/src/commands/configure.ts)_

## `castle create [NAME]`

create a new project

```
USAGE
  $ castle create [NAME]

ARGUMENTS
  NAME  name of the project

OPTIONS
  -f, --framework=Nuxt|Sapper|Next  [default: Nuxt]
  -v, --version=version             [default: latest]
```

_See code: [src/commands/create.ts](https://github.com/prismify/castle/blob/v1.0.0-alpha.1/src/commands/create.ts)_

## `castle help [COMMAND]`

display help for castle

```
USAGE
  $ castle help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.1/src/commands/help.ts)_

## `castle init`

```
USAGE
  $ castle init
```

_See code: [src/commands/init.ts](https://github.com/prismify/castle/blob/v1.0.0-alpha.1/src/commands/init.ts)_
<!-- commandsstop -->
