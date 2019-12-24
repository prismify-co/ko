
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
  }
}

async function run(action: 'add' | 'remove', packages: (string | IPackage)[], options: IPackageOptions = {}) {
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
    options.silent ? commandOptions.silent[manager] : ''
  ]

  const go = async (x: string) => new Promise((resolve, reject) => {
    try {
      exec(`${manager} ${command} ${opts.join(' ')} ${x}`, {
        cwd: options.cwd || process.cwd(),
        silent: options.silent === true
      })
      resolve()
    } catch (error) {
      reject(error)
    }
  })

  // Install core packages
  if (core_packages.length > 0) {
    await go(core_packages.join(' '))
  }

  if (dev_packages.length > 0) {
    await go(dev_packages.join(' '))
  }
}

async function add(packages: (string | IPackage)[], options: IPackageOptions = {}) {
  return run('add', packages, options)
}

async function remove(packages: (string | IPackage)[], options: IPackageOptions = {}) {
  return run('remove', packages, options)
}

// tslint:disable-next-line: one-variable-per-declaration
export const Package = {
  add,
  remove,
  which: async () => getManager()
}

export default Package
