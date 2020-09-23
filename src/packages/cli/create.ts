import Command, { flags } from '@oclif/command'
import * as inquirer from 'inquirer'
import { merge, omit } from 'lodash'

// import { CreateContext } from '@ko/types/contexts'
// import { setupTsnode } from '@ko/utils/setup-ts-node'
// import { exists } from '@ko/utils/fs'
import chalk from 'chalk'
import { resolve, join, sep } from 'path'
import execa from 'execa'
import latestVersion from 'latest-version'
import { setupTsnode } from '../utils/setup-ts-node'
import { exists } from '../utils/fs'
import { CreateContext } from '../../types/contexts'
import { FrameworkFactory } from '../frameworks/types'
import { isOnline } from '../utils/net'
import pkgm from '../package-manager'
import { ls } from 'shelljs'
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
    offline: flags.boolean({ default: false, char: 'f' }),
    'no-git': flags.boolean({ default: false }),
  }

  async run() {
    setupTsnode()
    const { args, flags } = this.parse(CreateCommand)

    // Set the project name
    const name = args.name as string

    // Resolves the name of the directory
    const resolveName = (name: string) => {
      if (name === '.' || name.includes(sep))
        return resolve(name).split(sep).slice(-1).join('')
      return name
    }

    const resolvePath = (name: string) => {
      if (name.includes(sep)) return name
      return resolve(name)
    }

    // Set the initial context for project creation
    let context: CreateContext = {
      name: resolveName(name),
      path: resolvePath(name),
      ...omit(flags, 'prompt', 'javascript'),
      typescript: flags.javascript === false,
      offline: flags.offline || (await isOnline(await pkgm().which())),
      git: flags['no-git'] === false,
    }

    // Update the context if prompt was specified
    if (flags.prompt) context = merge(context, await prompt())

    // Determine if the app directory already exists
    if (
      exists(join(context.path, name)) &&
      ls(join(context.path, name)).length > 0 &&
      (await promptDirtyDirectory(context.name))
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
      cwd: process.cwd(),
      path: context.path,
      // TODO: Implement dry-run
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

async function promptDirtyDirectory(name: string) {
  return await inquirer.prompt([
    {
      name: 'javascript',
      message: `The directory ${chalk.green(
        name
      )} is not empty. Would you like to continue?`,
      type: 'confirm',

      default: false,
    },
  ])
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

  const offline = await inquirer.prompt([
    {
      name: 'offline',
      message: 'Use package manager cache?',
      type: 'confirm',
      default: await isOnline(await pkgm().which()),
    },
  ])

  const git = await inquirer.prompt([
    {
      name: 'git',
      message: 'Use Git?',
      type: 'confirm',
      default: true,
    },
  ])
  return { framework, version, typescript: javascript === false, offline, git }
}
