import Command, { flags } from '@oclif/command'
import { cli } from 'cli-ux'
import dbg from 'debug'
import inquirer from 'inquirer'
import { merge, omit } from 'lodash'
import { InstallContext } from '@ko/types'
import install from '@ko/core/install'
import { setupTsnode } from '@ko/utils/setup-ts-node'
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
    cache: flags.boolean({ default: true, char: 'c' }),
  }

  async run() {
    // Setup ts-node
    setupTsnode()
    const { args, flags } = this.parse(InstallCommand)

    // Set the recipe name
    const name = args.name as string
    // Set the initial context for recipe installation
    let context: InstallContext = merge(omit(flags, 'prompt'), { name })
    // Update the context if prompt was specified
    if (flags.prompt) context = merge(await prompt(), context)

    debug(`Installing ${name}`)
    console.log('Configuring your app')
    console.log()

    install(context)
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

  const cache =
    (await inquirer.prompt([
      {
        name: 'cache',
        message: 'Disable cache?',
        type: 'list',
        choices: ['Yes', 'No'],
        default: 'No',
      },
    ])) === 'No'

  return { host, cache }
}
