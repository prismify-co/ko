import execa from 'execa'
import { existsSync as exists } from 'fs'
import { resolve } from 'path'
import { NPMPackage } from './types'
import dbg from 'debug'
import { read } from '../utils/fs'
// import { read } from '@ko/utils/fs'
const debug = dbg('ko:packages:package-manager')

type PackageManagerName = 'yarn' | 'npm'

export type NPMPackageManagerOptions = {
  silent?: boolean
  manager?: PackageManagerName
  cwd?: string
  offline?: boolean
}

export class PackageManager {
  which(): PackageManagerName {
    if (exists(resolve('yarn.lock'))) {
      return 'yarn'
    }
    return 'npm'
  }

  async init(options: NPMPackageManagerOptions = {}) {
    const manager: PackageManagerName = options?.manager || this.which()
    await execa(manager, ['init', '-y'])
  }

  async add(
    packages: (string | NPMPackage)[],
    options: NPMPackageManagerOptions = {}
  ) {
    const { dependencies, devDependencies } = this.packages(packages)
    const manager: PackageManagerName = options?.manager || this.which()
    // Install dependencies
    await this.run(manager, 'add', dependencies, false, options)
    // Install dev dependencies
    await this.run(manager, 'add', devDependencies, true, options)
  }

  addSync(
    packages: (string | NPMPackage)[],
    options: NPMPackageManagerOptions = {}
  ) {
    const { dependencies, devDependencies } = this.packages(packages)
    const manager: PackageManagerName = options?.manager || this.which()
    // Install dependencies
    this.runSync(manager, 'add', dependencies, false, options)
    // Install dev dependencies
    this.runSync(manager, 'add', devDependencies, true, options)
  }

  async remove(
    packages: (string | Omit<NPMPackage, 'version'>)[],
    options: NPMPackageManagerOptions = {}
  ) {
    const { dependencies, devDependencies } = this.packages(packages)
    const manager: PackageManagerName = options?.manager || this.which()
    // Install dependencies
    await this.run(manager, 'remove', dependencies, false, options)
    // Install dev dependencies
    await this.run(manager, 'remove', devDependencies, true, options)
  }

  removeSync(
    packages: (string | Omit<NPMPackage, 'version'>)[],
    options: NPMPackageManagerOptions = {}
  ) {
    const { dependencies, devDependencies } = this.packages(packages)
    const manager: PackageManagerName = options?.manager || this.which()
    // Install dependencies
    this.runSync(manager, 'remove', dependencies, false, options)
    // Install dev dependencies
    this.runSync(manager, 'remove', devDependencies, true, options)
  }

  private packages(packages: (string | NPMPackage)[]) {
    const devDependencies: string[] = packages
      .map((pkg) => {
        if (typeof pkg !== 'string' && pkg.dev)
          return pkg.version ? `${pkg.name}@${pkg.version}` : pkg.name
        return null
      })
      .filter((pkg) => pkg !== null) as string[]

    const dependencies: string[] = packages
      .map((pkg) => {
        if (typeof pkg !== 'string') {
          if (pkg.dev) return null
          return pkg.version ? `${pkg.name}@${pkg.version}` : pkg.name
        }
        return pkg
      })
      .filter((pkg) => pkg !== null) as string[]

    return { devDependencies, dependencies }
  }

  async install(options: NPMPackageManagerOptions = {}) {
    debug('Installing existing packages')

    const manager: PackageManagerName = options?.manager || this.which()
    return await execa(manager, ['install'], {
      cwd: options.cwd || process.cwd(),
    })
  }

  installSync(options: NPMPackageManagerOptions = {}) {
    debug('Installing existing packages')

    const manager: PackageManagerName = options?.manager || this.which()
    return execa.sync(manager, ['install'], {
      cwd: options.cwd || process.cwd(),
    })
  }

  /**
   * Determines whether a package exists in `package.json`
   * @param package The name of the package to check
   */
  has(name: string): boolean {
    const pkgPath = resolve('package.json')
    if (exists(pkgPath)) {
      const pkg = JSON.parse(read(pkgPath))
      const { devDependencies, dependencies } = pkg
      return (
        typeof (
          (devDependencies && devDependencies[name]) ||
          (dependencies && dependencies[name])
        ) !== 'undefined'
      )
    }

    return false
  }

  async run(
    manager: PackageManagerName,
    command: 'add' | 'remove',
    packages: string[],
    dev: boolean,
    options: NPMPackageManagerOptions
  ) {
    if (packages.length === 0) return

    let args: string[] = [command]

    if (command === 'remove' || (!dev && command === 'add')) {
      args = [...args, ...packages]
    } else {
      args = [...args, '-D', ...packages]
    }

    return await execa(manager, args, {
      cwd: options.cwd || process.cwd(),
    })
  }

  runSync(
    manager: PackageManagerName,
    command: 'add' | 'remove',
    packages: string[],
    dev: boolean,
    options: NPMPackageManagerOptions
  ) {
    if (packages.length === 0) return

    let args: string[] = [command]

    if (command === 'remove' || (!dev && command === 'add')) {
      args = [...args, ...packages]

      if (options.offline) {
        if (manager === 'yarn') {
          args = [...args, '--offline']
        } else {
          args = [...args, '--prefer-offline']
        }
      }
    } else {
      args = [...args, '-D', ...packages]
    }

    return execa.sync(manager, args, {
      cwd: options.cwd || process.cwd(),
    })
  }
}

export default function pkgm() {
  return new PackageManager()
}
