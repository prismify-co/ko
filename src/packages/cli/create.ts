import Command, { flags } from '@oclif/command'
import * as inquirer from 'inquirer'
import { merge, omit } from 'lodash'

// import { CreateContext } from '@ko/types/contexts'
// import { setupTsnode } from '@ko/utils/setup-ts-node'
// import { exists } from '@ko/utils/fs'
import chalk from 'chalk'
import { resolve, join } from 'path'
import execa from 'execa'
import latestVersion from 'latest-version'
import { setupTsnode } from '../utils/setup-ts-node'
import { exists } from '../utils/fs'
import { CreateContext } from '../../types/contexts'
import { FrameworkFactory } from '../frameworks/types'
// import { FrameworkFactory } from '@ko/frameworks/types'

export class CreateCommand extends Command {
  static description = 'create a new project'
  static args = [
    {
      name: 'name',
      description: 'The name of the project or "." for cwd',
      required: true,
    },
  ]

  static aliases = ['new']

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

    // Resolves the name of the directory
    const resolveName = (path: string) =>
      path === '.' ? process.cwd().split('/').splice(-1).join('') : path

    // Set the project name
    const name = args.name as string

    // Set the initial context for project creation
    let context: CreateContext = {
      name: resolveName(name),
      ...omit(flags, 'prompt', 'javascript'),
      typescript: flags.javascript === false,
    }
    // Update the context if prompt was specified
    if (flags.prompt) context = merge(context, await prompt())

    // Determine if the app directory already exists
    if (
      exists(resolve(name)) &&
      (await inquirer.prompt([
        {
          name: 'javascript',
          message: `The directory ${chalk.green(
            resolveName(name)
          )} is not empty. Would you like to continue?`,
          type: 'confirm',

          default: false,
        },
      ]))
    ) {
      return
    }

    const frameworkDir = join(__dirname, '../', 'frameworks', context.framework)
    if (!exists(frameworkDir)) {
      console.log(
        `${chalk.green(
          context.framework
        )} is not a supported framework 😭. Consider contributing to ko at https://github.com/prismify-co/ko.`
      )
      return
    }

    const factory = (await import(frameworkDir)).default as FrameworkFactory
    const generator = factory({
      ...context,
      cwd: resolve(name),
      dryRun: false,
    })
    const executor = generator.executor

    const listener = (message: string) => {
      console.log(message)
      console.log()
    }

    generator.subscribe('event', listener)
    executor.subscribe('event', (message: string) => {
      console.log(message)
      console.log()
    })

    generator.subscribeOnce('end', () => {
      generator.unsubscribeAll()
      executor.unsubscribeAll()
    })

    await generator.generate()
  }

  // eslint-disable-next-line require-await
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

  const javascript = await inquirer.prompt([
    {
      name: 'javascript',
      message: 'Use JavaScript?',
      type: 'confirm',
      default: false,
    },
  ])
  return { framework, version, typescript: javascript === false }
}
