import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import dbg = require('debug')
import * as inquirer from 'inquirer'

import create from '../actions/create'
const debug = dbg('ko:cli:create')

export class CreateCommand extends Command {
  static description = 'create a new project'
  static args = [
    { name: 'name', description: 'name of the project' }
  ]
  static flags = {
    framework: flags.string({ options: ['nuxt', 'sapper', 'next'], char: 'f', default: 'nuxt' }),
    version: flags.string({ char: 'v', default: 'latest' })
  }

  async run() {
    const { args, flags } = this.parse(CreateCommand)

    // Project name
    const name = (args.name || 'app') as string

    // Framework
    const framework: string = (
      flags.framework || ((await inquirer.prompt([{
        name: 'framework',
        message: 'select a framework',
        type: 'list',
        choices: [{ name: 'Nuxt' }, { name: 'Sapper' }, { name: 'Next' }]
      }])).framework as string).toLowerCase()
    )

    // Version
    const version: string = (
      flags.version || ((await inquirer.prompt([
        {
          name: 'version',
          message: 'set version for framework',
          type: 'input'
        }
      ])
      ).version as string).replace(/v/, '')
    )

    // Create the project
    try {
      cli.action.start(`creating project: ${name}, framework: ${framework}, version: ${version}`, undefined, { stdout: true })
      create(name, framework, version)
      cli.action.stop()
    } catch (error) {
      debug(`ko [error]: ${error}`)
      this.catch(error)
    }
  }
}
