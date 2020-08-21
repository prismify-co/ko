# ko

A project scaffolding and configuration CLI for the web

[![Node CI](https://github.com/prismify-co/ko/workflows/Node/badge.svg)](https://github.com/prismify-co/ko/actions?query=workflow%3ANode)
[![codecov](https://codecov.io/gh/prismify-co/ko/branch/master/graph/badge.svg)](https://codecov.io/gh/prismify-co/ko)
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@prismify/ko.svg)](https://npmjs.org/package/@prismify/ko)
[![Downloads/week](https://img.shields.io/npm/dw/@prismify/ko.svg)](https://npmjs.org/package/@prismify/ko)
[![License](https://img.shields.io/npm/l/@prismify/ko.svg)](https://github.com/prismify-co/ko/blob/master/package.json)

<!-- toc -->
* [ko](#ko)
* [About](#about)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# About

ko is a (WIP) project scaffolding and configuration tool that is meant to easily create or clone projects like Nuxt.js, Next.js, and Sapper.

This project is heavily inspired<sup><a id="one">[1](#one)</a></sup> by [Blitz](https://github.com/blitz-js/blitz). Blitz is a Ruby on Rails like project based on Next.js. Blitz also allows you to configure the project by using their CLI. However, rather than building a web framework, this project focuses on the configuration portion of their CLI and aims to target different frameworks.

At the time of this writng, ko can generate a basic Next.js app and clone repositories from GitHub, GitLab, and Bitbucket.

<sup id="1"><b>1</b></sup> Before knowing about Blitz, I had created a [Nuxt.js configurator](https://www.github.com/prismify-co/ko-utils) that took a simiar approach.

### Features

- Generate Next.js projects
- :warning: **Experimental** Configure the project via [Recipes](https://www.github.com/prismify-co/ko-recipes)

### Roadmap

- Support other frameworks like Nuxt.js and Sapper
- Support for Docker (?)
- Add `run` command (e.g. installing a list of recipes from `ko.config.json`)

### Get Started

#### 1. Create the project

_Create a Next.js app using TypeScript_

```bash
ko create hello
```

_Create a Next.js app using JavaScript_

```bash
ko create hello --javascript # or -j
```

#### 2. Configure the project

_`cd` into the project_

```bash
cd hello
```

_Install Chakra_

```bash
ko install chakra
```

#### 3. Start developing!

```bash
yarn dev
```

# Usage

<!-- usage -->
```sh-session
$ npm install -g @prismify/ko
$ ko COMMAND
running command...
$ ko (-v|--version|version)
@prismify/ko/0.1.0-2 darwin-x64 node-v14.0.0
$ ko --help [COMMAND]
USAGE
  $ ko COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`ko help [COMMAND]`](#ko-help-command)

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
<!-- commandsstop -->
