import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import dbg = require('debug')
import * as inquirer from 'inquirer'

import create from '../../actions/create'
const debug = dbg('ko:cli:create')

export class CreateNuxtCommand extends Command {
  static description = 'create a new next project'
  static args = [
    { name: 'name', description: 'name of the project' }
  ]
  static flags = {
    version: flags.string({ char: 'v', default: 'latest' })
  }

  async run() {
    const { args, flags } = this.parse(CreateNuxtCommand)

    // Project name
    const name = (args.name || 'app') as string

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
      cli.action.start(`creating project: ${name}, framework: next, version: ${version}`, undefined, { stdout: true })
      await create(name, 'next', version)
      cli.action.stop()
    } catch (error) {
      debug(`ko [error]: ${error}`)
      this.catch(error)
    }
  }
}
