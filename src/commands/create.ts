import Command, { flags } from '@oclif/command'
import cli from 'cli-ux'
import dbg = require('debug')
import execa = require('execa')
import * as inquirer from 'inquirer'
import { merge, omit } from 'lodash'

import create from '../actions/create'
import { CreateContext } from '../types'
import checkcwd from '../utils/check-cwd'
import promptContinue from '../utils/prompt-continue'
import latestVersion = require('latest-version')
const debug = dbg('ko:cli:create')

export class CreateCommand extends Command {
  static description = 'create a new project'
  static args = [
    {
      name: 'name',
      description: 'The name of the project or "." for cwd',
      required: true,
    },
  ]
  static flags = {
    framework: flags.string({
      options: ['next'],
      default: 'next',
      char: 'f',
    }),
    version: flags.string({ char: 'v', default: 'latest' }),
    typescript: flags.boolean({ default: true, char: 't' }),
    prompt: flags.boolean({ default: false, char: 'p' }),
  }

  async run() {
    const { args, flags } = this.parse(CreateCommand)

    // Set the project name
    const name = args.name as string

    // Set the initial context for project creation
    let context: CreateContext = { name, ...omit(flags, 'prompt') }
    // Update the context if prompt was specified
    if (flags.prompt) context = merge(context, await prompt())

    try {
      if (
        name === '.' &&
        !(await checkcwd()) &&
        !(await promptContinue(`This directory isn't clean.`))
      ) {
        this.exit()
      }

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

  async catch(error: any) {
    if (error?.oclif?.exit === 0) return
    throw error
  }
}

async function prompt() {
  const framework = ((
    await inquirer.prompt([
      {
        name: 'framework',
        message: 'Select a framework',
        type: 'list',
        choices: [{ name: 'Next' }],
      },
    ])
  ).framework as string).toLowerCase()

  const versions: string[] = JSON.parse(
    (await execa('npm', ['view', 'next', 'versions', '--json'])).stdout
  )
    .filter((v: string) => !v.includes('beta') || !v.includes('alpha'))
    .slice(-50)

  const latest = await latestVersion('next')

  const version = ((
    await inquirer.prompt([
      {
        name: 'version',
        message: 'Select a version',
        type: 'list',
        default: latest,
        choices: versions,
      },
    ])
  ).version as string).replace(/v/, '')

  const typescript =
    (await inquirer.prompt([
      {
        name: 'typescript',
        message: 'Enable TypeScript?',
        type: 'list',
        choices: ['Yes', 'No'],
        default: 'Yes',
      },
    ])) === 'Yes'
  return { framework, version, typescript }
}
