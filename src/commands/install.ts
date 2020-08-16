import Command, { flags } from '@oclif/command'
import { cli } from 'cli-ux'
import dbg from 'debug'
import inquirer from 'inquirer'
import { merge, omit } from 'lodash'
import { InstallContext } from '../types'
import install from '../packages/installer'
import { setupTsnode } from '../utils/setup-ts-node'
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
    const { args, flags } = this.parse(InstallCommand)
    // Setup ts-node
    setupTsnode()

    // Set the recipe name
    const name = args.name as string
    // Set the initial context for recipe installation
    let context: InstallContext = merge(omit(flags, 'prompt'), { name })
    // Update the context if prompt was specified
    if (flags.prompt) context = merge(await prompt(), context)

    try {
      debug(`ko [info]: installing ${name}`)
      cli.action.start('configuring your app')

      install(context)
      cli.action.stop()
    } catch (error) {
      debug('ko [error]: ', error)
      this.catch(error)
    }
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
