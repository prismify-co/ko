import globby from 'globby'
import handlebars from 'handlebars'
import { merge } from 'lodash'
import pkgm from '../../packages/package-manager'
import git, { CommitSummary } from 'simple-git'
import dbg from 'debug'

import { processFile } from '../transformer'
import {
  DependencyConfig,
  FileConfig,
  RecipeMeta,
  StepsConfig,
  TransformConfig,
} from './types'
import { resolve } from 'path'
import { write, read } from '@ko/utils/fs'

const debug = dbg('ko:packages:installer:executor')

export type ExecutorOptions = {
  cwd?: string
  dryRun?: boolean
}

export class Executor {
  #steps: StepsConfig[]
  #meta: RecipeMeta
  #options: ExecutorOptions
  commits: CommitSummary[] = []
  constructor(
    steps: StepsConfig[],
    meta: RecipeMeta,
    options: ExecutorOptions
  ) {
    this.#steps = steps
    this.#meta = meta
    this.#options = merge(options, { cwd: process.cwd() })
  }

  setOptions(options: ExecutorOptions) {
    this.#options = merge(this.#options, { cwd: process.cwd() }, options)
    return this
  }

  async run() {
    debug('ko [info]: installing packages')
    await this.#installPackages()
    debug('ko [info]: creating files')
    await this.#createFiles()
    debug('ko [info]: transforming files')
    await this.#transformFiles()
    return this
  }

  #installPackages = async () => {
    const dependencies = this.#steps.filter(
      (step) => step.type === 'dependency'
    ) as DependencyConfig[]
    for (const dc of dependencies) {
      if (dc.packages.length > 0) {
        // Install the packages
        await pkgm().add(dc.packages, { cwd: this.#options.cwd })
        // Add the changes
        await git(this.#options.cwd).add('*')
        // Commit the changes
        const commit = await git(this.#options.cwd).commit(dc.name)
        this.commits.push(commit)
      }
    }
  }

  #transformFile = async (
    { transform, name }: TransformConfig,
    path: string
  ) => {
    const original = read(path)
    const processed = await processFile(original, transform)
    write(path, processed, 'utf-8')
    // Add the changes
    await git(this.#options.cwd).add('*')
    // Commit the changes
    const commit = await git(this.#options.cwd).commit(name)
    this.commits.push(commit)
  }

  #transformFiles = async () => {
    const transforms = this.#steps.filter(
      (step) => step.type === 'transform'
    ) as TransformConfig[]

    for (const tc of transforms) {
      const paths = tc.files
      for (const path of paths) {
        if (globby.hasMagic(path)) {
          for await (const p of globby.stream(path, {
            expandDirectories: true,
          })) {
            await this.#transformFile(tc, p.toString('utf-8'))
          }
          continue
        }

        await this.#transformFile(tc, resolve(path))
      }
    }
  }

  #createFile = async (
    { name, context, path }: FileConfig,
    file: Buffer | string
  ) => {
    if (context) {
      const template = handlebars.compile(read(file.toString('utf-8')))
      file = template(context)
    }
    write(path, file, 'utf-8')
    // Add the changes
    await git(this.#options.cwd).add('*')
    // Commit the changes
    const commit = await git(this.#options.cwd).commit(name)
    this.commits.push(commit)
  }

  #createFiles = async () => {
    const files = this.#steps.filter(
      (step) => step.type === 'file'
    ) as FileConfig[]

    for (const fc of files) {
      if (globby.hasMagic(fc.path)) {
        for await (const file of globby.stream(fc.path, {
          expandDirectories: true,
        })) {
          await this.#createFile(fc, file)
        }
        continue
      }

      const file = read(fc.path)
      await this.#createFile(fc, file)
    }
  }
}

export default function executor(
  steps: StepsConfig[] = [],
  meta: RecipeMeta,
  options: ExecutorOptions
) {
  return new Executor(steps, meta, options)
}
