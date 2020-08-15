import { exists as has, readFile } from 'fs'
import { extract, fetch as gitly } from 'gitly'
import { homedir, tmpdir } from 'os'
import { join, resolve } from 'path'
import { tempdir } from 'shelljs'
import { InstallContext } from '../../types'
import { promisify } from 'util'

import { Executor } from './executor'
import pkgm from '../package-manager'
import execa from 'execa'

const exists = promisify(has)
const read = async (path: string) =>
  (await promisify(readFile)(path)).toString('utf-8')

const isNavtiveRecipe = (path: string) => /^([\w\-_]*)$/.test(path)

const isUrlRecipe = (path: string) =>
  /(https?\:\/\/)?(www\.)?(github|bitbucket|gitlab)\.com\//.test(path)

const isRepoShorthandRecipe = (path: string) =>
  /^([\w-_]*)\/([\w-_]*)$/.test(path)

const isLocalPath = async (path: string) =>
  !isNavtiveRecipe(path) &&
  !isUrlRecipe(path) &&
  !isRepoShorthandRecipe(path) &&
  exists(resolve(path))

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
    const path = join(destination, name, 'next')
    // Execute from directory
    return execute(path, await entry(path, true), dryRun)
  }

  if (isLocalPath(name)) {
    const path = resolve(name)
    // Execute from the local path
    return execute(path, await entry(path), dryRun)
  }

  if (isUrlRecipe(name)) {
    // Download from host
    const source = await gitly(name, gitlyOpts)
    // Extract the recipes into temp dir
    const destination = await extract(source, tempdir())
    // Execute from the directory
    return execute(destination, await entry(destination), dryRun)
  }
}

async function entry(
  path: string,
  official: boolean = false,
  framework: string = 'next'
) {
  // Check if this is the official repository
  path = official
    ? join(path, framework, 'package.json')
    : join(path, 'package.json')

  // Determine whether the entry point exists
  if (await exists(path)) {
    const json = JSON.parse(await read(path))

    if (!json.main) {
      throw new Error('A valid package.json does not exist')
    }

    return resolve(path, json.main)
  }

  throw new Error('A valid package.json does not exist')
}

async function execute(path: string, entry: string, dryRun: boolean = false) {
  // Save the current working directory
  const cwd = process.cwd()
  // Set the current working directory to the destination
  process.chdir(path)
  // Install the packages
  await pkgm().install()
  // Determine if we need to compile the files
  if (await exists(resolve('tsconfig.json'))) {
    // Install typescript (just in case)
    await pkgm().add(['typescript'])
    // Compile the files
    await execa(await pkgm().which(), ['run', 'tsc'])
  }
  // Grab the executor
  const executor = (await import(entry)).default as Executor
  // Run the executor
  executor
    .setOptions({
      dryRun,
    })
    .run()
  // Restore the current working directory
  process.chdir(cwd)

  return { executor, destination: path, cwd }
}
