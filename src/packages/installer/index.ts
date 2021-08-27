import { extract, download as gitly } from 'gitly'
import { homedir, tmpdir } from 'os'
import { join, resolve } from 'path'
import { mkdir } from 'shelljs'

import dbg from 'debug'
// import { read } from '@ko/utils/fs'
// import Executor from '@ko/executor'
// import { InstallContext } from '@ko/types/contexts'
// import pkgm from '@ko/package-manager'
import GitlyOptions from 'gitly/lib/interfaces/options'
import pkgm from '../package-manager'
import { InstallContext } from '../../types/contexts'
import Executor from '../executor'
import { exists, read } from '../utils/fs'
const debug = dbg('ko:packages:installer')

export const isNavtiveRecipe = (path: string) => /^([\w\-_]*)$/.test(path)

export const isUrlRecipe = (path: string) =>
  /(https?\:\/\/)?(www\.)?(github|bitbucket|gitlab)\.com\//.test(path)

export const isRepoShorthandRecipe = (path: string) =>
  /^([\w-_]*)\/([\w-_]*)$/.test(path)

export const isLocalPath = (path: string) =>
  !isNavtiveRecipe(path) &&
  !isUrlRecipe(path) &&
  !isRepoShorthandRecipe(path) &&
  exists(resolve(path))

export default class Installer {
  private gitlyOpts: GitlyOptions
  constructor(private readonly context: InstallContext & { cwd: string }) {
    const { host, cache } = this.context
    this.gitlyOpts = {
      temp: join(homedir(), '.ko'),
      ...(host ? { host } : {}),
      ...{ force: cache === false },
    }
  }

  async install() {
    const { name } = this.context

    // 1. Check if the recipe name is a simple name (i.e. "tailwind")
    if (isNavtiveRecipe(name)) {
      await this.installNative()
    }

    // 2. Check if the recipe name is a local path (i.e. "./path/to/recipe")
    if (isLocalPath(name)) {
      await this.installLocal()
    }

    // 3. Check if the recipe name is a repository (i.e. "(github|bitbucket|gitlab).com/org/repo" or "org/repo")
    if (isUrlRecipe(name)) {
      await this.installRemote()
    }
  }

  async installNative() {
    const { name, dryRun, offline } = this.context
    const cwd = process.cwd()

    debug(`${name} is native`)
    debug(`Gitly options`, this.gitlyOpts)
    // Grab the recipes
    const source = await gitly('prismify-co/ko-recipes', this.gitlyOpts)
    debug('Recipe source: %s', source)
    // Create a temp directory if it doesn't exist
    mkdir('-p', join(tmpdir(), 'ko-recipes'))
    // Extract the recipes into temp dir
    const destination = await extract(source, join(tmpdir(), 'ko-recipes'))
    debug('Recipe destination: %s', destination)
    const path = join(destination, name, 'next')
    debug('Execution path: %s', path)
    // Execute from directory
    return this.execute({
      cwd,
      path,
      entry: entry(path),
      dryRun,
      offline,
    })
  }

  installLocal() {
    const { dryRun, name, offline } = this.context
    const cwd = process.cwd()

    debug(`${name} is local`)
    const path = resolve(name)
    // Execute from the local path
    return this.execute({
      cwd,
      path,
      entry: entry(path),
      dryRun,
      offline,
    })
  }

  async installRemote() {
    const { cwd, dryRun, name, offline } = this.context
    debug(`${name} is remote`)
    // Download from host
    const source = await gitly(name, this.gitlyOpts)
    // Create a temp directory if it doesn't exist
    mkdir('-p', join(tmpdir(), 'ko-recipes'))
    // Extract the recipes into temp dir
    const destination = await extract(source, join(tmpdir(), 'ko-recipes'))
    // Execute from the directory
    return this.execute({
      cwd,
      path: destination,
      entry: entry(destination),
      dryRun,
      offline,
    })
  }

  /**
   * Loads the exectutor and runs the steps/tasks
   * @param app The path to the app
   * @param path The path to the recipe
   * @param entry The entry path
   * @param dryRun Determines whether we should execute
   */
  async execute({
    cwd,
    path,
    entry,
    dryRun,
    offline,
  }: {
    cwd: string
    path: string
    entry: string
    dryRun: boolean
    offline: boolean
  }) {
    // Set the current working directory to the destination
    process.chdir(path)
    // Install the packages
    await pkgm({ silent: true, offline }).install()
    // Restore the current working directory
    process.chdir(cwd)
    // Grab the executor
    const executor = (await import(entry)).default as Executor
    // Run the executor
    await executor
      .setOptions({
        dryRun: dryRun,
        cwd,
      })
      .run()

    return { executor, path, entry, cwd }
  }
}

export function entry(path: string) {
  // Check if this is the official repository
  const pkgPath = join(path, 'package.json')

  // Determine whether the entry point exists
  if (exists(pkgPath)) {
    const json = JSON.parse(read(pkgPath))

    if (!json.main) {
      throw new Error('A valid entry point does not exist in package.json')
    }

    return resolve(path, json.main)
  }

  throw new Error(`A valid package.json does not exist at ${path}`)
}
