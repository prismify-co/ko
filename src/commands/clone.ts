import Command from '@oclif/command'
import dbg = require('debug')
import { extract, fetch } from 'gitly'
import { homedir } from 'os'
import { join } from 'path'
const debug = dbg('ko:cli:clone')

export class CloneCommand extends Command {
  static description = 'clone an existing project'
  static args = [
    {
      name: 'repository',
      description:
        'The repository url (e.g. org/repo, github:org/repo, https://www.github.com/org/repo)',
      required: true,
    },
    { name: 'destination', description: 'The destination to clone (optional)' },
  ]

  async run() {
    const { args } = this.parse(CloneCommand)

    // The repository to clone
    const name = args.repository as string
    if (!name) {
      return this.error('No repository provided')
    }
    // Create the temporary folder as ~/.ko
    const opts = { temp: join(homedir(), '.ko') }
    // By default the folder to extract to is the current working directory
    let destination = process.cwd()
    if (args.destination) {
      if (!['.', destination].includes(args.destination)) {
        destination = join(process.cwd(), args.destination)
      }
    }

    debug(`ko [info]: fetching ${name}`)
    const source = await fetch(name, opts)
    debug(`ko [info]: extracting ${source} into ${destination}`)
    await extract(source, destination, opts)
  }
}
