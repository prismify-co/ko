import chalk from 'chalk'
import { mkpdir } from '@ko/utils/mkpdir'
import { resolve } from 'path'
import pkgm from '@ko/package-manager'
import git from 'simple-git'
import dbg from 'debug'
import Steps from '@ko/steps'
import Executor, { ExecutorOptions } from '@ko/executor'
import { Subject, NextObserver, ErrorObserver, CompletionObserver } from 'rxjs'

const debug = dbg('ko:core:generate:next')

export class Generator extends Steps {
  private readonly observable = new Subject<string>()
  constructor(
    private readonly name: string,
    private readonly framework: string,
    protected options: ExecutorOptions = {}
  ) {
    super()
  }

  /**
   * Initialize the application
   */
  private async init() {
    // Create app directory
    mkpdir(this.name)
    // Change directory
    process.chdir(resolve(this.name))
    // Initialize package.json
    await pkgm().init()
    // Initialize git
    await git().init()

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

  /**
   * Generate the application
   */
  async generate() {
    this.observable.next(
      `Creating a ✨ ${chalk.cyan('shiny')} ✨ new ${
        this.framework
      } app in ${chalk.green(resolve(this.name))}`
    )

    debug('Initialize the application')
    await this.init()
    const exe = new Executor(this._steps, this.options)

    debug('Start generating the application')
    await exe.run()

    debug(`Add changes to git`)
    await git().add('*')
    // Add the changes to the commit
    await git().commit('Add initial files')

    this.observable.next(`${chalk.green('Success!')} 🎉`)
    this.observable.next(
      `${chalk.cyan('cd')} into ${chalk.green(this.name)} and start developing!`
    )

    return exe
  }
}

export default function generator(
  name: string,
  framework: string,
  options: ExecutorOptions = {}
) {
  return new Generator(name, framework, options)
}
