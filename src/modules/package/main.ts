
import { existsSync } from 'fs'
import { join } from 'path'
import { exec } from 'shelljs'
import which = require('which')

export type IPackage = {
  name: string
  version: string
  dev: boolean
}

export type IPackageOptions = {
  silent?: boolean,
  manager?: 'yarn' | 'npm',
  cwd?: string
}

function getManager(): string | never {
  if (which.sync('yarn', { nothrow: true })) {
    return 'yarn'
  }

  which.sync('npm')
  return 'npm'
}

const commands: any = {
  add: {
    yarn: 'add',
    npm: 'install'
  },
  remove: {
    yarn: 'remove',
    npm: 'uninstall'
  }
}

const commandOptions: any = {
  silent: {
    yarn: '-s',
    npm: '--silent'
  },
  dev: {
    yarn: '--dev',
    npm: '--save-dev'
  }
}

function run(action: 'add' | 'remove', packages: (string | IPackage)[], options: IPackageOptions = {}) {
  // Get the package manager
  const manager = options?.manager || getManager()

  // Make sure package.json exists
  if (!existsSync(join(options.cwd || process.cwd(), 'package.json'))) {
    throw new Error('package.json not found')
  }

  // Normalize the packages
  const _packages = packages.map(pkg => {
    if (typeof pkg === 'string') {
      return { name: pkg, version: 'latest', dev: false }
    }
    return pkg
  })

  // Get the dev dependencies
  const dev_packages = _packages
    .filter(pkg => pkg.dev === true)
    .map(pkg => `${pkg.name}@${pkg.version}`)
  // Get the core packages
  const core_packages = _packages
    .filter(pkg => pkg.dev === false)
    .map(pkg => `${pkg.name}@${pkg.version}`)

  const command = commands[action][manager]
  const opts = [
    options.silent ? commandOptions.silent[manager] : '',
  ]

  const go = (packages: string[], dev = false) => {
    const devOpts = ((dev === true) ? commandOptions.dev[manager] : '')
    exec(`${manager} ${command} ${opts.join(' ') + devOpts} ${packages.join(' ')}`, {
      cwd: options.cwd || process.cwd(),
      silent: options.silent === true
    })
  }

  // Install core packages
  if (core_packages.length > 0) {
    go(core_packages)
  }

  if (dev_packages.length > 0) {
    go(dev_packages, true)
  }
}

function add(packages: (string | IPackage)[], options: IPackageOptions = {}) {
  return run('add', packages, options)
}

function remove(packages: (string | IPackage)[], options: IPackageOptions = {}) {
  return run('remove', packages, options)
}

// tslint:disable-next-line: one-variable-per-declaration
export const Package = {
  add,
  remove,
  which: async () => getManager()
}

export default Package
