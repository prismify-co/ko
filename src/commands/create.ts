import Command, { flags } from '@oclif/command'
import cli from 'cli-ux'
import dbg = require('debug')
import execa = require('execa')
import * as inquirer from 'inquirer'
import { merge, omit } from 'lodash'

import create from '../actions/create'
import { CreateContext } from '../types'
const debug = dbg('ko:cli:create')

export class CreateCommand extends Command {
  static description = 'create a new project'
  static args = [{ name: 'name', description: 'name of the project' }]
  static flags = {
    framework: flags.string({ options: ['next'], default: 'next', char: 'f' }),
    version: flags.string({ char: 'v', default: 'latest' }),
    typescript: flags.boolean({ default: true, char: 't' }),
    prompt: flags.boolean({ default: false, char: 'p' }),
  }

  async run() {
    const { args, flags } = this.parse(CreateCommand)

    // Set the project name
    const name = (args.name || 'app') as string
    // Set the initial context for project creation
    let context: CreateContext = { name, ...omit(flags, 'prompt') }
    // Update the context if prompt was specified
    if (flags.prompt) context = merge(context, await prompt())

    try {
      cli.action.start(
        `creating project: ${name}, framework: ${context.framework}, version: ${context.version}`,
        undefined,
        { stdout: true }
      )

      // Create the project
      await create(context)

      cli.action.stop()
    } catch (error) {
      debug(`ko [error]: ${error}`)
      this.catch(error)
    }
  }
}

async function prompt() {
  const framework = ((
    await inquirer.prompt([
      {
        name: 'framework',
        message: 'select a framework',
        type: 'list',
        choices: [{ name: 'Next' }],
      },
    ])
  ).framework as string).toLowerCase()

  const versions = (await execa('npm', ['view', 'next', 'versions'])).stdout
    .replace(/\[|\]/g, '')
    .split(',')

  const version = ((
    await inquirer.prompt([
      {
        name: 'version',
        message: 'set version for framework',
        type: 'list',
        choices: versions.slice(-5),
      },
    ])
  ).version as string).replace(/v/, '')

  const typescript =
    (await inquirer.prompt([
      {
        name: 'typescript',
        message: '',
        type: 'input',
        choices: ['true', 'false'],
        default: 'true',
      },
    ])) === 'true'
  return { framework, version, typescript }
}
