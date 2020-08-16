# ko

A project scaffolding and configuration CLI for the web

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@prismify/ko.svg)](https://npmjs.org/package/@prismify/ko)
[![Downloads/week](https://img.shields.io/npm/dw/@prismify/ko.svg)](https://npmjs.org/package/@prismify/ko)
[![License](https://img.shields.io/npm/l/@prismify/ko.svg)](https://github.com/prismify-co/ko/blob/master/package.json)

<!-- toc -->

- [ko](#ko)
- [About](#about)
- [Roadmap](#roadmap)
- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# About

ko is a (WIP) project scaffolding and configuration tool that is meant to easily create or clone projects like Nuxt.js, Next.js, and Sapper.

This project is heavily inspired<sup><a id="one">[1](#one)</a></sup> by [Blitz](https://github.com/blitz-js/blitz). Blitz is a Ruby on Rails like project based on Next.js. Blitz also allows you to configure the project by using their CLI. However, rather than building a web framework, this project focuses on the configuration portion of their CLI and aims to target different frameworks.

At the time of this writng, ko can generate a basic Next.js app and clone repositories from GitHub, GitLab, and Bitbucket.

<sup id="1"><b>1</b></sup> Before knowing about Blitz, I had created a [Nuxt.js configurator](https://www.github.com/prismify-ko/ko-utils) that took a simiar approach.

### Example

1. Create the project

```bash
ko create
```

## Features

- Generate Next.js projects
- :warning: **Experiemental** Configure the project via [Recipes](https://www.github.com/prismify-ko/ko-recipes)

## Roadmap

- Support other frameworks like Nuxt.js and Sapper
- Support for Docker (?)
- Add `run` command (e.g. installing a list of recipes from `ko.config.json`)

# Usage

<!-- usage -->

```sh-session
$ npm install -g @prismify/ko
$ ko COMMAND
running command...
$ ko (-v|--version|version)
@prismify/ko/0.0.13 darwin-x64 node-v14.0.0
$ ko --help [COMMAND]
USAGE
  $ ko COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`ko clone REPOSITORY [DESTINATION]`](#ko-clone-repository-destination)
- [`ko create NAME`](#ko-create-name)
- [`ko help [COMMAND]`](#ko-help-command)
- [`ko install NAME`](#ko-install-name)

## `ko clone REPOSITORY [DESTINATION]`

clone an existing project

```
USAGE
  $ ko clone REPOSITORY [DESTINATION]

ARGUMENTS
  REPOSITORY   The repository url (e.g. org/repo, github:org/repo, https://www.github.com/org/repo)
  DESTINATION  The destination to clone (optional)
```

_See code: [src/packages/cli/clone.ts](https://github.com/prismify-co/ko/blob/v0.0.13/src/packages/cli/clone.ts)_

## `ko create NAME`

create a new project

```
USAGE
  $ ko create NAME

ARGUMENTS
  NAME  The name of the project or "." for cwd

OPTIONS
  -f, --framework=next   [default: next]
  -j, --javascript       Use JavaScript
  -p, --prompt
  -v, --version=version  [default: latest]
```

_See code: [src/packages/cli/create.ts](https://github.com/prismify-co/ko/blob/v0.0.13/src/packages/cli/create.ts)_

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

## `ko install NAME`

install the recipe and configure the app

```
USAGE
  $ ko install NAME

ARGUMENTS
  NAME  The name of the recipe or the repository where the recipe (e.g. "tailwind", org/repo, github:org/repo)

OPTIONS
  -c, --cache
  -d, --dryRun
  -p, --prompt
  --host=github|gitlab|bitbucket  [default: github]
```

_See code: [src/packages/cli/install.ts](https://github.com/prismify-co/ko/blob/v0.0.13/src/packages/cli/install.ts)_

<!-- commandsstop -->
