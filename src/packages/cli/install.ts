import Command, { flags } from '@oclif/command'
import dbg from 'debug'
import inquirer from 'inquirer'
import { merge, omit } from 'lodash'
// import { InstallContext } from '@ko/types/contexts'
// import Installer from '@ko/installer'
// import { setupTsnode } from '@ko/utils/setup-ts-node'
import chalk from 'chalk'
import { setupTsnode } from '../utils/setup-ts-node'
import { InstallContext } from '../../types/contexts'
import Installer from '../installer'
import { isOnline } from '../utils/net'
import pkgm from '../package-manager'

const debug = dbg('ko:commands:install')

export class InstallCommand extends Command {
  static description = 'install the recipe and configure the app'
  static args = [
    {
      name: 'name',
      description:
        'The name of the recipe or the repository where the recipe (e.g. "tailwind", org/repo, github:org/repo)',
      required: true,
    },
  ]

  static aliases = ['add']

  static flags = {
    dryRun: flags.boolean({ default: false, char: 'd' }),
    host: flags.string({
      default: 'github',
      options: ['github', 'gitlab', 'bitbucket'],
    }),
    prompt: flags.boolean({ default: false, char: 'p' }),
    'no-cache': flags.boolean({ default: false, char: 'c' }),
    offline: flags.boolean({ default: false, char: 'f' }),
    'no-git': flags.boolean({ default: false, char: 'g' }),
  }

  async run() {
    // Setup ts-node
    setupTsnode()
    const { args, flags } = this.parse(InstallCommand)

    // Set the recipe name
    const name = args.name as string
    // Set the initial context for recipe installation
    let context: InstallContext = merge(omit(flags, 'prompt'), {
      name,
      offline: flags.offline || (await isOnline(await pkgm().which())),
      git: flags['no-git'] === false,
      cache: flags['no-cache'] === false,
      dryRun: false,
      host: ''
    })
    // Update the context if prompt was specified
    if (flags.prompt) context = merge(await prompt(), context)

    debug(`Installing ${name}`)
    console.log('Configuring your app')
    console.log()

    await new Installer({ ...context, cwd: process.cwd() }).install()

    console.log(`${chalk.green('Success!')} 🎉`)
    console.log()

    console.log(`${chalk.green(name)} has been configured.`)
  }
}

async function prompt() {
  const host = ((await inquirer.prompt([
    {
      name: 'typescript',
      message: 'Choose a host',
      type: 'list',
      choices: ['GitHub', 'GitLab', 'BitBucket'],
      default: 'GitHub',
    },
  ])) as string).toLowerCase()

  const cache = await inquirer.prompt([
    {
      name: 'cache',
      message: 'Disable cache?',
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

  return { host, cache, offline, git }
}
