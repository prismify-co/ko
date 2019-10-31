# ko

A project scaffolding CLI for the web

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@prismify/ko.svg)](https://npmjs.org/package/@prismify/ko)
[![Downloads/week](https://img.shields.io/npm/dw/@prismify/ko.svg)](https://npmjs.org/package/@prismify/ko)
[![License](https://img.shields.io/npm/l/@prismify/ko.svg)](https://github.com/prismify/ko.git/blob/master/package.json)

<!-- toc -->
* [ko](#ko)
* [About](#about)
* [ko.config.yml](#koconfigyml)
* [Limitations](#limitations)
* [Roadmap](#roadmap)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# About

ko is a project scaffolding tool that is meant to easily create and configure projects for Nuxt.js, Next.js, and Sapper.
ko is at it's early stages so anything can change. At the moment, ko is inspired to be something similar to Ansible but for the common web frameworks. 

For example, imagine that you've followed the docs to create a minimal Nuxt app on your local machine. You then install the necessary modules for Nuxt and started to copy and paste the code snippets that give you a place to start. But, before you know it, it's taken you some amount of time to get your Nuxt app up and going.

ko tries to eliminate the need to manually configure the project as much as possible by allowing you to define the tasks necessary to configure your project.

### Example

1. Create the project

```bash
ko create
```

2. Define the configuration

```yml
# ko.config.yml
name: app
framework:
  name: nuxt
  version: latest

tasks:
  - name: 'Install Tailwindcss'
    task:
      name: tailwindcss
      version: latest
```

3. Configure the project

```bash
ko run
```

# Limitations

* ko can only generate a minimal nuxt application at the moment.
* ko cannot configure projects at the moment.

# Roadmap

* Support other projects like Next.js and Sapper
* Support ko tasks (see About)
* Support initialization of Git and Docker


# Usage

<!-- usage -->
```sh-session
$ npm install -g @prismify/ko
$ ko COMMAND
running command...
$ ko (-v|--version|version)
@prismify/ko/0.0.0 darwin-x64 node-v13.0.1
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
  -f, --framework=nuxt|sapper|next  [default: nuxt]
  -v, --version=version             [default: latest]
```

_See code: [src/commands/create.ts](https://github.com/prismify/ko/blob/v0.0.0/src/commands/create.ts)_

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
