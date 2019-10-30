import {Command, flags} from '@oclif/command'

import configure from '../actions/configure'

export class ConfigureCommand extends Command {
  static description = 'configure the project using the configuration file'
  static flags = {
    scope: flags.string({options: ['ui'], char: 's'})
  }
  async run() {
    // TODO: Handle case where no scope is provided

    const {flags} = this.parse(ConfigureCommand)
    if (flags.scope) {
      return configure(flags.scope)
    }

    ['ui'].forEach(scope => configure(scope))
  }
}
