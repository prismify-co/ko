import Command from '@oclif/command'
import dbg from 'debug'
import { extract, fetch } from 'gitly'
import { homedir } from 'os'
import { join } from 'path'
import { setupTsnode } from '../utils/setup-ts-node'
// import { setupTsnode } from '@ko/utils/setup-ts-node'
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
    setupTsnode()
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

    debug(`Fetching ${name}`)
    const source = await fetch(name, opts)
    debug(`Extracting ${source} into ${destination}`)
    await extract(source, destination, opts)
  }
}
