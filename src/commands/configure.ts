import {Command} from '@oclif/command'

import configure from '../actions/configure'

// import configure from '../actions/configure'

export class ConfigureCommand extends Command {
  static description = 'configure the project using the configuration file'
  async run() {
    configure()
  }
}
