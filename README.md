# ko

A project scaffolding CLI for the web

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@prismify/ko.svg)](https://npmjs.org/package/@prismify/ko)
[![Downloads/week](https://img.shields.io/npm/dw/@prismify/ko.svg)](https://npmjs.org/package/ko)
[![License](https://img.shields.io/npm/l/@prismify/ko.svg)](https://github.com/https://github.com/prismify/ko.git/blob/master/package.json)

<!-- toc -->
* [ko](#ko)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g @prismify/ko
$ ko COMMAND
running command...
$ ko (-v|--version|version)
@prismify/ko/1.0.0-alpha.1 darwin-x64 node-v13.0.1
$ ko --help [COMMAND]
USAGE
  $ ko COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`ko create [NAME]`](#ko-create-name)
* [`ko help [COMMAND]`](#ko-help-command)

## `ko create [NAME]`

create a new project

```
USAGE
  $ ko create [NAME]

ARGUMENTS
  NAME  name of the project

OPTIONS
  -f, --framework=Nuxt|Sapper|Next  [default: Nuxt]
  -v, --version=version             [default: latest]
```

_See code: [src/commands/create.ts](https://github.com/prismify/ko/blob/v1.0.0-alpha.1/src/commands/create.ts)_

## `ko help [COMMAND]`

display help for ko

```
USAGE
  $ ko help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.1/src/commands/help.ts)_
<!-- commandsstop -->
