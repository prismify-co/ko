import { Command } from '@oclif/command'
// import * as inquirer from 'inquirer'

import run from '../actions/run'

export class CreateCommand extends Command {
  static description = 'start the configuration process'
  async run() {
    run()
  }
}
