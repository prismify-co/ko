import chalk from 'chalk'
// import { mkpdir } from '@ko/utils/mkpdir'
import { resolve, join } from 'path'
// import pkgm from '@ko/package-manager'
import git from 'simple-git'
import dbg from 'debug'
// import Steps from '@ko/steps'
// import Executor from '@ko/executor'
import { EventEmitter } from 'events'
import Executor from '../executor'
import Steps from '../steps'
import { mkpdir } from '../utils/mkpdir'
import pkgm from '../package-manager'
import {
  KoObservable,
  KoEventEmitter,
  KoEventType,
  KoEvents,
} from '../../types/events'

const debug = dbg('ko:packages:generator')

import { ExecutorOptions } from '../executor'

export interface GeneratorOptions extends ExecutorOptions {}

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
    /* istanbul ignore next */
    this.observable.on<T>(event, listener)
    /* instabul ignore next */
    return this
  }

  subscribeOnce<T extends KoEventType>(event: T, listener: KoEvents[T]) {
    /* istanbul ignore next */
    this.observable.once<T>(event, listener)
    /* instabul ignore next */
    return this
  }

  unsubscribe<T extends KoEventType>(event: T, listener: KoEvents[T]) {
    /* istanbul ignore next */
    this.observable.off<T>(event, listener)
    /* instabul ignore next */
    return this
  }

  unsubscribeAll<T extends KoEventType>(event?: T) {
    /* istanbul ignore next */
    this.observable.removeAllListeners(event)
    /* instabul ignore next */
    return this
  }

  /**
   * Initialize the application
   */
  private async init() {
    debug(
      `Initializing at ${join(this.options.cwd || process.cwd(), this.name)}`
    )
    // Create app directory
    mkpdir(this.name)
    debug(`Changing directory to ${this.options.cwd || resolve(this.name)}`)
    // Change directory
    process.chdir(this.options.cwd || resolve(this.name))
    debug(`Initializing package.json`)
    // Initialize package.json
    await pkgm().init()
    await this.#commit()

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

    await this.init()
    await this.executor.run()
    await this.#commit()

    /* istanbul ignore next */
    this.observable.emit('event', `${chalk.green('Success!')} 🎉`)
    /* istanbul ignore next */
    this.observable.emit(
      'event',
      `${chalk.cyan('cd')} into ${chalk.green(this.name)} and start developing!`
    )
    /* istanbul ignore next */
    this.observable.emit('end')
    return this
  }

  #commit = async () => {
    if (this.options.git) {
      debug(`Adding changes to git`)
      await git().add('*')
      // Add the changes to the commit
      await git().commit('Add initial files')
    }
  }
}

export default function generator(
  name: string,
  framework: string,
  options: GeneratorOptions
) {
  return new Generator(name, framework, options)
}
