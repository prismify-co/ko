import globby from 'globby'
import handlebars from 'handlebars'
import { merge } from 'lodash'
import pkgm from '@ko/package-manager'
import git, { CommitSummary } from 'simple-git'
import dbg from 'debug'

import { processFile } from '@ko/transformer'

import { resolve } from 'path'
import { write, read } from '@ko/utils/fs'
import { Subject, NextObserver, ErrorObserver, CompletionObserver } from 'rxjs'
import chalk from 'chalk'
import { StepsConfig } from '@ko/steps/types'
import {
  DependencyConfig,
  TransformConfig,
  FileConfig,
  CustomConfig,
} from './types'

const debug = dbg('ko:packages:executor')

export type ExecutorOptions = {
  cwd?: string
  dryRun?: boolean
}

export default class Executor {
  #steps: StepsConfig[]
  #options: ExecutorOptions
  commits: CommitSummary[] = []
  private readonly observable = new Subject<string>()
  constructor(steps: StepsConfig[], options: ExecutorOptions) {
    this.#steps = steps
    this.#options = merge(options, { cwd: process.cwd() })
  }

  setOptions(options: ExecutorOptions) {
    this.#options = merge(this.#options, { cwd: process.cwd() }, options)
    return this
  }

  async run() {
    debug('Installing packages')
    await this.#installPackages()
    debug('Creating files')
    await this.#createFiles()
    debug('Running custom actions')
    await this.#customActions()
    debug('Transforming files')
    await this.#transformFiles()
    return this
  }

  subscribe(
    observer?:
      | NextObserver<string>
      | ErrorObserver<string>
      | CompletionObserver<string>
      | undefined
  ) {
    this.observable.subscribe(observer)
    return this
  }

  #installPackages = async () => {
    const dependencies = this.#steps.filter(
      (step) => step.type === 'dependency'
    ) as DependencyConfig[]

    if (dependencies.length > 0) {
      this.observable.next(
        `Installing ${chalk.cyan(
          dependencies.length - 1
        )} packages. This might take a couple of minutes.`
      )
    }

    for (const dc of dependencies) {
      if (dc.packages.length > 0 && dc.condition !== false) {
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

  transformFile = async (
    { transform, name, condition }: TransformConfig,
    path: string
  ) => {
    // Do not execute if the condition is false
    if (condition === false) return

    const original = read(path)
    const processed = processFile(original, transform)
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

    if (transforms.length > 0) {
      this.observable.next(
        `Transforming ${chalk.cyan(transforms.length - 1)} files.`
      )
    }

    for (const tc of transforms) {
      const paths = tc.files
      for (const path of paths) {
        if (globby.hasMagic(path)) {
          for await (const p of globby.stream(path, {
            expandDirectories: true,
          })) {
            await this.transformFile(tc, p.toString('utf-8'))
          }
          continue
        }

        await this.transformFile(tc, resolve(path))
      }
    }
  }

  createFile = async (
    { name, context, path, condition }: FileConfig,
    file: Buffer | string
  ) => {
    // Do not execute if the condition is false
    if (condition === false) return

    if (context) {
      const template = handlebars.compile(read(file.toString('utf-8')))
      file = template(context)
    }
    write(path, file)
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

    if (files.length > 0) {
      this.observable.next(`'Creating ${chalk.cyan(files.length - 1)} files.'`)
    }

    for (const fc of files) {
      if (globby.hasMagic(fc.path)) {
        for await (const file of globby.stream(fc.path, {
          expandDirectories: true,
        })) {
          await this.createFile(fc, file)
        }
        continue
      }

      const file = read(fc.path)
      await this.createFile(fc, file)
    }
  }

  #customActions = async () => {
    const actions = this.#steps.filter(
      (step) => step.type === 'custom'
    ) as CustomConfig[]

    if (actions.length > 0) {
      this.observable.next(
        `Running ${chalk.cyan(actions.length - 1)} custom actions.`
      )

      for (const action of actions) {
        // Do not execute if the condition is false
        if (action.condition === false) {
          continue
        }

        await action.run()
      }
    }
  }
}