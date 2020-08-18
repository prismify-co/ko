import { existsSync as exists } from 'fs'
import { extract, fetch as gitly } from 'gitly'
import { homedir, tmpdir } from 'os'
import { join, resolve } from 'path'
import { mkdir } from 'shelljs'

import dbg from 'debug'
import { read } from '@ko/utils/fs'
import Executor from '@ko/executor'
import { InstallContext } from '@ko/types'
import pkgm from '@ko/package-manager'
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
  constructor(private readonly context: InstallContext) {}

  async install() {
    const { host, cache, dryRun } = this.context
    // 1. Check if the recipe name is a simple name (i.e. "tailwind")
    // 2. Check if the recipe name is a local path (i.e. "./path/to/recipe")
    // 3. Check if the recipe name is a repository (i.e. "(github|bitbucket|gitlab).com/org/repo" or "org/repo")
    const gitlyOpts = {
      temp: join(homedir(), '.ko'),
      ...(host ? { host } : {}),
      ...(cache === false ? { force: true } : {}),
    }

    const cwd = process.cwd()

    if (isNavtiveRecipe(name)) {
      debug(`${name} is native`)
      // Grab the recipes
      const source = await gitly('prismify-co/ko-recipes', gitlyOpts)
      // Create a temp directory if it doesn't exist
      mkdir('-p', join(tmpdir(), 'ko-recipes'))
      // Extract the recipes into temp dir
      const destination = await extract(source, join(tmpdir(), 'ko-recipes'))
      const path = join(destination, name, 'next')
      // Execute from directory
      return this.execute(cwd, path, await entry(path), dryRun)
    }

    if (isLocalPath(name)) {
      debug(`${name} is local`)
      const path = resolve(name)
      // Execute from the local path
      return this.execute(cwd, path, await entry(path), dryRun)
    }

    if (isUrlRecipe(name)) {
      debug(`${name} is remote`)
      // Download from host
      const source = await gitly(name, gitlyOpts)
      // Create a temp directory if it doesn't exist
      mkdir('-p', join(tmpdir(), 'ko-recipes'))
      // Extract the recipes into temp dir
      const destination = await extract(source, join(tmpdir(), 'ko-recipes'))
      // Execute from the directory
      return this.execute(cwd, destination, await entry(destination), dryRun)
    }
  }

  /**
   * Loads the exectutor and runs the steps/tasks
   * @param app The path to the app
   * @param path The path to the recipe
   * @param entry The entry path
   * @param dryRun Determines whether we should execute
   */
  private async execute(
    cwd: string,
    path: string,
    entry: string,
    dryRun: boolean
  ) {
    // Set the current working directory to the destination
    process.chdir(path)
    // Install the packages
    await pkgm().install({ silent: true })
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
      throw new Error('A valid entry point does not exist')
    }

    return resolve(path, json.main)
  }

  throw new Error('A valid package.json does not exist')
}
