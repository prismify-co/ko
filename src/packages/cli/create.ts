import Command, { flags } from '@oclif/command'
import cli from 'cli-ux'
import dbg from 'debug'
import execa from 'execa'
import * as inquirer from 'inquirer'
import { merge, omit } from 'lodash'

import create from '@ko/core/create'
import { CreateContext } from '@ko/types'
import checkcwd from '@ko/utils/check-cwd'
import promptContinue from '@ko/utils/prompt-continue'
import latestVersion from 'latest-version'
import { setupTsnode } from '@ko/utils/setup-ts-node'
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
    javascript: flags.boolean({
      default: false,
      char: 'j',
      description: 'Use JavaScript',
    }),
    prompt: flags.boolean({ default: false, char: 'p' }),
  }

  async run() {
    setupTsnode()
    const { args, flags } = this.parse(CreateCommand)
    // Set the project name
    const name = args.name as string

    // Set the initial context for project creation
    let context: CreateContext = {
      name,
      ...omit(flags, 'prompt', 'javascript'),
      typescript: flags.javascript === false,
    }
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

  const javascript =
    (await inquirer.prompt([
      {
        name: 'javascript',
        message: 'Use JavaScript?',
        type: 'list',
        choices: ['Yes', 'No'],
        default: 'No',
      },
    ])) === 'No'
  return { framework, version, typescript: javascript === false }
}
