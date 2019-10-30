import {Command, flags} from '@oclif/command'
import * as inquirer from 'inquirer'

import create from '../actions/create'

export class CreateCommand extends Command {
  static description = 'create a new project'
  static args = [
    {name: 'name', description: 'name of the project'}
  ]
  static flags = {
    framework: flags.string({options: ['Nuxt', 'Sapper', 'Next'], char: 'f', default: 'Nuxt'}),
    version: flags.string({char: 'v', default: 'latest'})
  }

  async run() {
    const {args, flags} = this.parse(CreateCommand)

    // Project name
    const name = (args.name || 'app') as string

    // Framework
    const framework: string = (
      flags.framework || (await inquirer.prompt([{
        name: 'framework',
        message: 'select a framework',
        type: 'list',
        choices: [{name: 'Nuxt'}, {name: 'Sapper'}, {name: 'Next'}]
      }])).framework
    )

    // Version
    const version: string = (
      flags.version || (await inquirer.prompt([
        {
          name: 'version',
          message: 'set version for framework',
          type: 'input'
        }
      ])
      ).version.replace(/v/, '')
    )

    this.log(`Project Name: ${name}, Framework: ${framework.toLowerCase()}, Version: ${version}`)

    // Create the project
    create(name, framework.toLowerCase(), version)
  }
}
