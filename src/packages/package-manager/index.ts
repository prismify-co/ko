import execa from 'execa'
import {NPMPackage, PackageManagerCommand, PackageManagerType} from './types'
import dbg from 'debug'
import {packageExists, packageExistsSync} from "./utils/package-exists";
import {which, whichSync} from "./fn/which";
import {init, initSync} from "./fn/init";
import {run, RunOptions, runSync} from "./fn/run";
import {splitPackageByType} from "./utils/split-package-by-type";

// import { read } from '@ko/utils/fs'
const debug = dbg('ko:packages:package-manager')

export type NPMPackageManagerOptions = {
  silent?: boolean
  manager?: PackageManagerType
  cwd?: string
  offline?: boolean
}

export class PackageManager {
  constructor(
    private readonly options: NPMPackageManagerOptions = {cwd: process.cwd()}
  ) {
  }

  which = which
  whichSync = whichSync

  init(): Promise<void> {
    const manager: PackageManagerType = this.options?.manager || this.whichSync()
    return init(manager, this.options.cwd || process.cwd())
  }

  initSync(): void {
    const manager: PackageManagerType = this.options?.manager || this.whichSync()
    return initSync(manager, this.options.cwd || process.cwd())
  }

  async add(packages: (string | NPMPackage)[]) {
    await this.#$run('add', packages)
  }

  addSync(packages: (string | NPMPackage)[]) {
    this.#$runSync('add', packages)
  }

  async remove(packages: (string | Omit<NPMPackage, 'version'>)[]) {
    await this.#$run('remove', packages)
  }

  removeSync(packages: (string | Omit<NPMPackage, 'version'>)[]) {
    this.#$runSync('remove', packages)
  }


  async install() {
    debug('Installing existing packages')
    const manager: PackageManagerType = this.options?.manager || await this.which()
    return execa(manager, ['install'], {
      cwd: this.options.cwd || process.cwd(),
    })
  }

  /**
   * Install packages synchronously
   */
  installSync() {
    debug('Installing existing packages')

    const manager: PackageManagerType = this.options?.manager || this.whichSync()
    return execa.sync(manager, ['install'], {
      cwd: this.options.cwd || process.cwd(),
    })
  }

  /**
   * Determines whether a package exists in `package.json` asynchronously
   * @param name The name of the package to check
   */
  has = (name: string): Promise<boolean> => packageExists(name)
  /**
   * Determines whether a package exists in `package.json` synchronously
   * @param name The name of the package to check
   */
  hasSync = (name: string): boolean => packageExistsSync(name)


  async run(command: PackageManagerCommand, args: string[], options: Omit<Partial<RunOptions>, 'args' | 'command' | 'manager'>) {
    return run({
      manager: await this.#getManager(),
      command,
      args,
      cwd: this.#getCwd(),
      ...options
    })
  }

  runSync(command: PackageManagerCommand, args: string[], options: Omit<Partial<RunOptions>, 'args' | 'command' | 'manager'>) {
    return runSync({
      manager: this.#getManagerSync(),
      command,
      args,
      cwd: this.#getCwd(),
      ...options
    })
  }

  async #$run(command: PackageManagerCommand, packages: (string | NPMPackage)[]) {
    const {dependencies, devDependencies} = splitPackageByType(packages)
    const isDev = (await this.#getManager()) === 'yarn' && command === 'remove' ? false : devDependencies.length > 0
    const dev = { flags: {dev: isDev, offline: this.options.offline}}
    const std = { flags: {dev: false, offline: this.options.offline}}
    // Install dependencies
    await this.run(command, dependencies, std as RunOptions)
    // Install dev dependencies
    await this.run(command, devDependencies, dev as RunOptions)
  }

  #$runSync(command: PackageManagerCommand, packages: (string | NPMPackage)[]) {
    const {dependencies, devDependencies} = splitPackageByType(packages)
    const isDev = this.#getManagerSync() === 'yarn' && command === 'remove' ? false : devDependencies.length > 0
    const dev = {flags: {dev: isDev, offline: this.options.offline}}
    const std = {flags: {dev: false, offline: this.options.offline}}
    // Install dependencies
    this.runSync(command, dependencies, std as RunOptions)
    // Install dev dependencies
    this.runSync(command, devDependencies, dev as RunOptions)
  }

  async #getManager() {
    return this.options.manager || await this.which()
  }

  #getManagerSync() {
    return this.options.manager || this.whichSync()
  }

  #getCwd() {
    return this.options.cwd || process.cwd()
  }

}

export default function pkgm(options: NPMPackageManagerOptions = {}) {
  return new PackageManager(options)
}
