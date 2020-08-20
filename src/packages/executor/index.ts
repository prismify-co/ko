import globby from 'globby'
import pkgm from '@ko/package-manager'
import { StepsConfig } from '@ko/steps/types'

import git, { CommitSummary } from 'simple-git'
import dbg from 'debug'
import * as vfs from 'vinyl-fs'

import { basename } from 'path'
import chalk from 'chalk'
import {
  DependencyConfig,
  TransformConfig,
  FileConfig,
  CustomConfig,
} from './types'

import {
  KoEventEmitter,
  KoObservable,
  KoEvents,
  KoEventType,
} from '@ko/types/events'

import { EventEmitter } from 'events'
import { handlebars, transformer } from '@ko/utils/streams'
import gulp from 'gulp'
import { Transformer } from '@ko/transformer/types'

const debug = dbg('ko:packages:executor')

export type ExecutorOptions = {
  cwd?: string
  dryRun?: boolean
  git?: boolean
}

export default class Executor implements KoObservable {
  #steps: StepsConfig[]
  #options: ExecutorOptions
  readonly commits: CommitSummary[] = []
  private readonly observable = new EventEmitter() as KoEventEmitter
  constructor(steps: StepsConfig[], options: ExecutorOptions) {
    this.#steps = steps
    this.#options = options
  }

  subscribe<T extends KoEventType>(event: T, listener: KoEvents[T]) {
    this.observable.on<T>(event, listener)
    return this
  }

  subscribeOnce<T extends KoEventType>(event: T, listener: KoEvents[T]) {
    this.observable.once<T>(event, listener)
    return this
  }

  unsubscribe<T extends KoEventType>(event: T, listener: KoEvents[T]) {
    this.observable.off<T>(event, listener)
    return this
  }

  unsubscribeAll<T extends KoEventType>(event?: T) {
    this.observable.removeAllListeners(event)
    return this
  }

  setOptions(options: ExecutorOptions) {
    this.#options = options
    return this
  }

  async run() {
    this.observable.emit('start')
    debug('Installing packages')
    await this.#installPackages()
    debug('Creating files')
    await this.#createFiles()
    debug('Running custom actions')
    await this.#customActions()
    debug('Transforming files')
    await this.#transformFiles()
    this.observable.emit('end')
    return this
  }

  #installPackages = async () => {
    const dependencies = this.#steps.filter(
      (step) => step.type === 'dependency'
    ) as DependencyConfig[]

    if (dependencies.length > 0) {
      this.observable.emit(
        'event',
        `Installing ${chalk.cyan(
          dependencies.map((d) => d.packages.length).reduce((a, b) => a + b) - 1
        )} packages. This might take a couple of minutes.`
      )
    }

    for (const dc of dependencies) {
      if (dc.packages.length > 0 && dc.condition !== false) {
        // Install the packages
        await pkgm().add(dc.packages, { cwd: this.#options.cwd })
        await this.#commit(dc.name)
      }
    }
  }

  #transformFiles = async () => {
    const transforms = this.#steps.filter(
      (step) => step.type === 'transform'
    ) as TransformConfig[]

    if (transforms.length > 0) {
      this.observable.emit(
        'event',
        `Transforming ${chalk.cyan(transforms.length - 1)} files.`
      )
    }

    const transform = (source: string, tr: Transformer) => {
      return new Promise((resolve, reject) => {
        const dest = vfs.dest(source.replace(basename(source), ''))
        dest.on('finish', () => resolve())
        dest.on('error', (error) => reject(error))
        vfs.src(source).pipe(transformer(tr)).pipe(dest)
      })
    }

    for (const tc of transforms) {
      const paths = tc.files
      for await (const path of globby.stream(paths, {
        cwd: this.#options.cwd,
      })) {
        await transform(path.toString('utf-8'), tc.transform)
        await this.#commit(tc.name)
      }
    }
  }

  #createFiles = async () => {
    const files = this.#steps.filter(
      (step) => step.type === 'file'
    ) as FileConfig[]

    if (files.length > 0) {
      this.observable.emit(
        'event',
        `'Creating ${chalk.cyan(files.length - 1)} files.'`
      )
    }

    const copyAndInterpolate = (
      source: string,
      destination: string,
      context: any
    ) =>
      new Promise((resolve, reject) => {
        const dest = gulp.dest(destination)
        dest.on('finish', () => resolve())
        dest.on('error', (error) => reject(error))

        vfs.src(source).pipe(handlebars(context)).pipe(dest)
      })

    for (const fc of files) {
      await copyAndInterpolate(fc.path, fc.target, fc.context)
      await this.#commit(fc.name)
    }
  }

  #customActions = async () => {
    const actions = this.#steps.filter(
      (step) => step.type === 'custom'
    ) as CustomConfig[]

    if (actions.length > 0) {
      this.observable.emit(
        'event',
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

  #commit = async (name: string) => {
    if (this.#options.git) {
      // Add the changes
      await git(this.#options.cwd).add('*')
      // Commit the changes
      const commit = await git(this.#options.cwd).commit(name)
      this.commits.push(commit)
    }
  }
}
