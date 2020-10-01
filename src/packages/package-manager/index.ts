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
  constructor(
    private readonly options: NPMPackageManagerOptions = { cwd: process.cwd() }
  ) {}

  which(): PackageManagerName {
    if (exists(resolve('yarn.lock'))) {
      return 'yarn'
    }
    return 'npm'
  }

  async init() {
    const manager: PackageManagerName = this.options?.manager || this.which()
    await execa(manager, ['init', '-y'], { cwd: this.options.cwd })
  }

  async add(packages: (string | NPMPackage)[]) {
    const { dependencies, devDependencies } = this.packages(packages)
    // Install dependencies
    await this.run('add', dependencies, false)
    // Install dev dependencies
    await this.run('add', devDependencies, true)
  }

  addSync(packages: (string | NPMPackage)[]) {
    const { dependencies, devDependencies } = this.packages(packages)
    // Install dependencies
    this.runSync('add', dependencies, false)
    // Install dev dependencies
    this.runSync('add', devDependencies, true)
  }

  async remove(packages: (string | Omit<NPMPackage, 'version'>)[]) {
    const { dependencies, devDependencies } = this.packages(packages)
    // Install dependencies
    await this.run('remove', dependencies, false)
    // Install dev dependencies
    await this.run('remove', devDependencies, true)
  }

  removeSync(packages: (string | Omit<NPMPackage, 'version'>)[]) {
    const { dependencies, devDependencies } = this.packages(packages)
    // Install dependencies
    this.runSync('remove', dependencies, false)
    // Install dev dependencies
    this.runSync('remove', devDependencies, true)
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

  async install() {
    debug('Installing existing packages')

    const manager: PackageManagerName = this.options?.manager || this.which()
    return await execa(manager, ['install'], {
      cwd: this.options.cwd || process.cwd(),
    })
  }

  installSync() {
    debug('Installing existing packages')

    const manager: PackageManagerName = this.options?.manager || this.which()
    return execa.sync(manager, ['install'], {
      cwd: this.options.cwd || process.cwd(),
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

  async run(command: 'add' | 'remove' | 'run', args: string[], dev: boolean) {
    if (args.length === 0) return

    const manager = this.options.manager || this.which()

    let finalArgs: string[] = [command]

    if (command === 'remove' || (!dev && command === 'add')) {
      /* instabul ignore next */
      if (this.options.offline) {
        if (manager === 'yarn') {
          finalArgs = [...finalArgs, '--offline']
        } else {
          finalArgs = [...finalArgs, '--prefer-offline']
        }
      }
      finalArgs = [...finalArgs, ...args]
    } else {
      finalArgs = [...finalArgs, '-D', ...args]
    }

    return await execa(manager, finalArgs, {
      cwd: this.options.cwd || process.cwd(),
    })
  }

  runSync(command: 'add' | 'remove' | 'run', args: string[], dev: boolean) {
    if (args.length === 0) return

    const manager = this.options.manager || this.which()

    let finalArgs: string[] = [command]

    if (command === 'remove' || (!dev && command === 'add')) {
      /* instabul ignore next */
      if (this.options.offline) {
        if (manager === 'yarn') {
          finalArgs = [...finalArgs, '--offline']
        } else {
          finalArgs = [...finalArgs, '--prefer-offline']
        }
      }

      finalArgs = [...finalArgs, ...args]
    } else {
      finalArgs = [...finalArgs, '-D', ...args]
    }

    return execa.sync(manager, finalArgs, {
      cwd: this.options.cwd || process.cwd(),
    })
  }
}

export default function pkgm(options: NPMPackageManagerOptions = {}) {
  return new PackageManager(options)
}
