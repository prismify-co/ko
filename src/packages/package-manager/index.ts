import execa from 'execa'
import { exists, readFile } from 'fs'
import { resolve } from 'path'
import { promisify } from 'util'

import { NPMPackage } from '../installer/types'

const existsAysnc = promisify(exists)
const read = promisify(readFile)

type PackageManagerName = 'yarn' | 'npm'

export type NPMPackageManagerOptions = {
  silent?: boolean
  manager?: PackageManagerName
  cwd?: string
}

export class PackageManager {
  async which(): Promise<PackageManagerName> {
    if (await existsAysnc(resolve('yarn.lock'))) {
      return 'yarn'
    }
    return 'npm'
  }

  async add(
    packages: (string | NPMPackage)[],
    options: NPMPackageManagerOptions = {}
  ) {
    const { dependencies, devDependencies } = this.packages(packages)
    const manager: PackageManagerName = options?.manager || (await this.which())
    // Install dependencies
    await this.run(manager, 'add', dependencies, false, options)
    // Install dev dependencies
    await this.run(manager, 'add', devDependencies, true, options)
  }

  async remove(
    packages: (string | Omit<NPMPackage, 'version'>)[],
    options: NPMPackageManagerOptions = {}
  ) {
    const { dependencies, devDependencies } = this.packages(packages)
    const manager: PackageManagerName = options?.manager || (await this.which())
    // Install dependencies
    await this.run(manager, 'remove', dependencies, false, options)
    // Install dev dependencies
    await this.run(manager, 'remove', devDependencies, true, options)
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

  /**
   * Determines whether a package exists in `package.json`
   * @param package The name of the package to check
   */
  async has(name: string): Promise<boolean> {
    const pkgPath = resolve('package.json')
    if (await existsAysnc(pkgPath)) {
      const pkg = JSON.parse((await read(pkgPath)).toString('utf-8'))
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

    let args: string[] = [command]

    if (command === 'remove' || (!dev && command === 'add')) {
      args = [...args, ...packages]
    } else {
      args = [...args, '-D', ...packages]
    }

    const { stdout } = await execa(manager, args, {
      cwd: options.cwd || process.cwd(),
    })
    if (!options.silent) console.log(stdout)
  }
}

export default function pkgm() {
  return new PackageManager()
}
