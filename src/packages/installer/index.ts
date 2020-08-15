import { exists } from 'fs'
import { extract, fetch as gitly } from 'gitly'
import { homedir, tmpdir } from 'os'
import { join, resolve } from 'path'
import { tempdir } from 'shelljs'
import { InstallContext } from '../../types'
import { promisify } from 'util'

import { Executor } from './executor'

const existsAsync = promisify(exists)

const isNavtiveRecipe = (path: string) => /^([\w\-_]*)$/.test(path)

const isUrlRecipe = (path: string) =>
  /(https?\:\/\/)?(www\.)?(github|bitbucket|gitlab)\.com\//.test(path)

const isRepoShorthandRecipe = (path: string) =>
  /^([\w-_]*)\/([\w-_]*)$/.test(path)

const isLocalPath = async (path: string) =>
  !isNavtiveRecipe(path) &&
  !isUrlRecipe(path) &&
  !isRepoShorthandRecipe(path) &&
  existsAsync(resolve(path))

export default async function install({
  name,
  dryRun,
  host,
  cache,
}: InstallContext) {
  // 1. Check if the recipe name is a simple name (i.e. "tailwind")
  // 2. Check if the recipe name is a local path (i.e. "./path/to/recipe")
  // 3. Check if the recipe name is a repository (i.e. "(github|bitbucket|gitlab).com/org/repo" or "org/repo")
  const gitlyOpts = {
    temp: join(homedir(), '.ko'),
    ...(host ? { host } : {}),
    ...(cache === false ? { force: true } : {}),
  }

  if (isNavtiveRecipe(name)) {
    // Grab the recipes
    const source = await gitly('prismify-co/ko-recipes', gitlyOpts)
    // Extract the recipes into temp dir
    const destination = await extract(source, tmpdir())
    // Execute from directory
    return execute(join(destination, name, 'next'), dryRun)
  }

  if (isLocalPath(name)) {
    // Execute from the local path
    return execute(name, dryRun)
  }

  if (isUrlRecipe(name)) {
    // Download from host
    const source = await gitly(name, gitlyOpts)
    // Extract the recipes into temp dir
    const destination = await extract(source, tempdir())
    // Execute from the directory
    return execute(destination, dryRun)
  }
}

async function execute(path: string, dryRun: boolean) {
  const executor = (await import(path)).default as Executor
  return executor.setOptions({ dryRun }).run()
}
