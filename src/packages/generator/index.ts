import chalk from 'chalk'
import { mkpdir } from '@ko/utils/mkpdir'
import { resolve } from 'path'
import pkgm from '@ko/package-manager'
import git from 'simple-git'
import dbg from 'debug'
import Steps from '@ko/steps'
import Executor from '@ko/executor'
import { EventEmitter } from 'events'
import {
  KoEventEmitter,
  KoEvents,
  KoEventType,
  KoObservable,
} from '@ko/types/events'
import { GeneratorOptions } from './types'

const debug = dbg('ko:core:generate:next')

export class Generator extends Steps implements KoObservable {
  private readonly observable = new EventEmitter() as KoEventEmitter
  readonly executor: Executor
  constructor(
    private readonly name: string,
    private readonly framework: string,
    readonly options: GeneratorOptions
  ) {
    super()
    this.options = options
    this.executor = new Executor(this._steps, this.options)
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

  /**
   * Initialize the application
   */
  private async init() {
    // Create app directory
    mkpdir(this.name)
    // Change directory
    process.chdir(this.options.cwd || resolve(this.name))
    // Initialize package.json
    await pkgm().init()
    // Initialize git
    await git().init()

    return this
  }

  /**
   * Generate the application
   */
  async generate() {
    this.observable.emit('start')
    this.observable.emit(
      'event',
      `Creating a ✨ ${chalk.cyan('shiny')} ✨ new ${
        this.framework
      } app in ${chalk.green(resolve(this.name))}`
    )

    debug('Initialize the application')
    await this.init()
    debug('Start generating the application')
    await this.executor.run()

    debug(`Add changes to git`)
    await git().add('*')
    // Add the changes to the commit
    await git().commit('Add initial files')

    this.observable.emit('event', `${chalk.green('Success!')} 🎉`)
    this.observable.emit(
      'event',
      `${chalk.cyan('cd')} into ${chalk.green(this.name)} and start developing!`
    )
    this.observable.emit('end')
    return this
  }
}

export default function generator(
  name: string,
  framework: string,
  options: GeneratorOptions
) {
  return new Generator(name, framework, options)
}
