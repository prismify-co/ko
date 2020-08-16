# ko

A project scaffolding and configuration CLI for the web

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@prismify/ko.svg)](https://npmjs.org/package/@prismify/ko)
[![Downloads/week](https://img.shields.io/npm/dw/@prismify/ko.svg)](https://npmjs.org/package/@prismify/ko)
[![License](https://img.shields.io/npm/l/@prismify/ko.svg)](https://github.com/prismify-co/ko/blob/master/package.json)

<!-- toc -->
* [ko](#ko)
* [About](#about)
* [Roadmap](#roadmap)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# About

ko is a (WIP) project scaffolding and configuration tool that is meant to easily create or clone projects like Nuxt.js, Next.js, and Sapper.

This project is heavily inspired by [Blitz](https://github.com/blitz-js/blitz). Blitz is a Ruby on Rails like project based on Next.js. Blitz also allows you to configure the project by using their CLI. Rather than building a web framework, this project focuses on the configuration portion of their CLI and aims to target different frameworks.

At the time of this writng, ko can generate a basic Next.js app and clone repositories from GitHub, GitLab, and Bitbucket.

### Example

1. Create the project

```bash
ko create
```

# Roadmap

- Support other projects like Nuxt.js and Sapper
- Support ko recipes (Experimental! Please do not use!)
  - Configures your project by running `ko install [recipe]`. (e.g. Chakra)
- Support for Docker

# Usage

<!-- usage -->
```sh-session
$ npm install -g @prismify/ko
$ ko COMMAND
running command...
$ ko (-v|--version|version)
@prismify/ko/0.0.11 darwin-x64 node-v14.0.0
$ ko --help [COMMAND]
USAGE
  $ ko COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`ko clone REPOSITORY [DESTINATION]`](#ko-clone-repository-destination)
* [`ko create NAME`](#ko-create-name)
* [`ko help [COMMAND]`](#ko-help-command)
* [`ko install RECIPE`](#ko-install-recipe)

## `ko clone REPOSITORY [DESTINATION]`

clone an existing project

```
USAGE
  $ ko clone REPOSITORY [DESTINATION]

ARGUMENTS
  REPOSITORY   The repository url (e.g. org/repo, github:org/repo, https://www.github.com/org/repo)
  DESTINATION  The destination to clone (optional)
```

_See code: [src/commands/clone.ts](https://github.com/prismify-co/ko/blob/v0.0.11/src/commands/clone.ts)_

## `ko create NAME`

create a new project

```
USAGE
  $ ko create NAME

ARGUMENTS
  NAME  The name of the project or "." for cwd

OPTIONS
  -f, --framework=next   [default: next]
  -p, --prompt
  -t, --typescript
  -v, --version=version  [default: latest]
```

_See code: [src/commands/create.ts](https://github.com/prismify-co/ko/blob/v0.0.11/src/commands/create.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_

## `ko install RECIPE`

install the recipe and configure the app

```
USAGE
  $ ko install RECIPE

ARGUMENTS
  RECIPE  The name of the recipe or the repository where the recipe (e.g. "tailwind", org/repo, github:org/repo)

OPTIONS
  -c, --cache
  -d, --dryRun
  -p, --prompt
  --host=github|gitlab|bitbucket  [default: github]
```

_See code: [src/commands/install.ts](https://github.com/prismify-co/ko/blob/v0.0.11/src/commands/install.ts)_
<!-- commandsstop -->
