import execa from 'execa'
import { existsSync as exists } from 'fs'
import { resolve } from 'path'
import { NPMPackage } from './types'
import dbg from 'debug'
import { read } from '@ko/utils/fs'
const debug = dbg('ko:packages:package-manager')

type PackageManagerName = 'yarn' | 'npm'

export type NPMPackageManagerOptions = {
  silent?: boolean
  manager?: PackageManagerName
  cwd?: string
}

export class PackageManager {
  which(): PackageManagerName {
    if (exists(resolve('yarn.lock'))) {
      return 'yarn'
    }
    return 'npm'
  }

  async add(
    packages: (string | NPMPackage)[],
    options: NPMPackageManagerOptions = {}
  ) {
    try {
      const { dependencies, devDependencies } = this.packages(packages)
      const manager: PackageManagerName = options?.manager || this.which()
      // Install dependencies
      await this.run(manager, 'add', dependencies, false, options)
      // Install dev dependencies
      await this.run(manager, 'add', devDependencies, true, options)
    } catch (error) {
      debug('ko [error]: An error occurred')
      debug(error)
    }
  }

  addSync(
    packages: (string | NPMPackage)[],
    options: NPMPackageManagerOptions = {}
  ) {
    try {
      const { dependencies, devDependencies } = this.packages(packages)
      const manager: PackageManagerName = options?.manager || this.which()
      // Install dependencies
      this.runSync(manager, 'add', dependencies, false, options)
      // Install dev dependencies
      this.runSync(manager, 'add', devDependencies, true, options)
    } catch (error) {
      debug('ko [error]: An error occurred')
      debug(error)
    }
  }

  async remove(
    packages: (string | Omit<NPMPackage, 'version'>)[],
    options: NPMPackageManagerOptions = {}
  ) {
    try {
      const { dependencies, devDependencies } = this.packages(packages)
      const manager: PackageManagerName = options?.manager || this.which()
      // Install dependencies
      await this.run(manager, 'remove', dependencies, false, options)
      // Install dev dependencies
      await this.run(manager, 'remove', devDependencies, true, options)
    } catch (error) {
      debug('ko [error]: An error occurred')
      debug(error)
    }
  }

  removeSync(
    packages: (string | Omit<NPMPackage, 'version'>)[],
    options: NPMPackageManagerOptions = {}
  ) {
    try {
      const { dependencies, devDependencies } = this.packages(packages)
      const manager: PackageManagerName = options?.manager || this.which()
      // Install dependencies
      this.runSync(manager, 'remove', dependencies, false, options)
      // Install dev dependencies
      this.runSync(manager, 'remove', devDependencies, true, options)
    } catch (error) {
      debug('ko [error]: An error occurred')
      debug(error)
    }
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

  async install(options: NPMPackageManagerOptions = {}): Promise<void> {
    debug('ko [info]: installing existing packages')

    const manager: PackageManagerName = options?.manager || this.which()
    const { stdout } = await execa(manager, ['install'], {
      cwd: options.cwd || process.cwd(),
    })

    debug(stdout)
  }

  installSync(options: NPMPackageManagerOptions = {}): void {
    debug('ko [info]: installing existing packages')

    const manager: PackageManagerName = options?.manager || this.which()
    const { stdout } = execa.sync(manager, ['install'], {
      cwd: options.cwd || process.cwd(),
    })

    debug(stdout)
  }

  /**
   * Determines whether a package exists in `package.json`
   * @param package The name of the package to check
   */
  async has(name: string): Promise<boolean> {
    const pkgPath = resolve('package.json')
    if (exists(pkgPath)) {
      const pkg = JSON.parse(read(pkgPath))
      const { devDependencies, dependencies } = pkg
      return (
        (devDependencies && devDependencies[name]) ||
        (dependencies && dependencies[name])
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
    debug(`ko [info]: run:${command}`)

    let args: string[] = [command]

    if (command === 'remove' || (!dev && command === 'add')) {
      args = [...args, ...packages]
    } else {
      args = [...args, '-D', ...packages]
    }

    const { stdout } = await execa(manager, args, {
      cwd: options.cwd || process.cwd(),
    })

    debug(stdout)
    // if (!options.silent) console.log(stdout)
  }

  async runSync(
    manager: PackageManagerName,
    command: 'add' | 'remove',
    packages: string[],
    dev: boolean,
    options: NPMPackageManagerOptions
  ) {
    if (packages.length === 0) return
    debug(`ko [info]: run:${command}`)

    let args: string[] = [command]

    if (command === 'remove' || (!dev && command === 'add')) {
      args = [...args, ...packages]
    } else {
      args = [...args, '-D', ...packages]
    }

    const { stdout } = await execa.sync(manager, args, {
      cwd: options.cwd || process.cwd(),
    })

    debug(stdout)
    // if (!options.silent) console.log(stdout)
  }
}

export default function pkgm() {
  return new PackageManager()
}
