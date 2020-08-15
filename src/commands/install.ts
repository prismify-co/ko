import Command, { flags } from '@oclif/command'
import { cli } from 'cli-ux'
import dbg from 'debug'
import inquirer from 'inquirer'
import { merge, omit } from 'lodash'
import { InstallContext } from '../types'
import install from '../packages/installer'
const debug = dbg('ko:commands:install')

export class InstallCommand extends Command {
  static description = 'install the recipe and configure the app'
  static args = [
    {
      name: 'recipe',
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

    // Set the recipe name
    const name = args.name as string
    // Set the initial context for recipe installation
    let context: InstallContext = { name, ...omit(flags, 'prompt') }
    // Update the context if prompt was specified
    if (flags.prompt) context = merge(context, await prompt())

    try {
      debug('ko [info]: installing ')
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
  const host =
    (await inquirer.prompt([
      {
        name: 'typescript',
        message: '',
        type: 'input',
        choices: ['github', 'gitlab', 'bitbucket'],
        default: 'github',
      },
    ])) === 'true'

  const cache =
    (await inquirer.prompt([
      {
        name: 'typescript',
        message: '',
        type: 'input',
        choices: ['true', 'false'],
        default: 'true',
      },
    ])) === 'true'

  return { host, cache }
}
