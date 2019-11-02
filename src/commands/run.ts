import { Command } from '@oclif/command'
import { cli } from 'cli-ux'

import run from '../actions/run'
import { load } from '../utils/config'
// import * as inquirer from 'inquirer'

export class CreateCommand extends Command {
  static description = 'start the configuration process'
  async run() {
    try {
      cli.action.start(`configuring your ${load().framework.name} app`)
      await run()
      cli.action.stop()
    } catch (error) {
      this.catch(error)
    }
  }
}
