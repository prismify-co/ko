import { BuilderBase, executor } from '@ko/builder'
import chalk from 'chalk'
import cli from 'cli-ux'
import { mkpdir } from '@ko/utils/mkpdir'
import { join, resolve } from 'path'
import pkgm from '@ko/package-manager'
import git from 'simple-git'
import dbg from 'debug'
import { exists } from '@ko/utils/fs'
import { rm } from 'shelljs'

const debug = dbg('ko:core:generate:next')

export class Generator extends BuilderBase {
  constructor(
    private readonly name: string,
    private readonly framework: string
  ) {
    super()
  }

  /**
   * Initialize the application
   */
  private async init() {
    let shouldContinue = false
    if (
      process.env.NODE_ENV !== 'test' &&
      exists(resolve(this.name)) &&
      (shouldContinue =
        (await cli.confirm(
          `The directory ${chalk.green(
            this.name
          )} is not empty. Would you like to continue?`
        )) === false)
    ) {
      return this
    }

    if (shouldContinue) {
      rm('-rf', resolve(join(this.name, 'package.json')))
    }

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

  async generate() {
    console.log(
      `Creating a ✨ ${chalk.cyan('shiny')} ✨ new ${
        this.framework
      } app in ${chalk.green(resolve(this.name))}`
    )
    console.log()

    debug('Initialize the application')
    await this.init()
    const exe = executor(this.steps, this.options)

    debug('Start generating the application')
    await exe.run()

    debug(`Add changes to git`)
    await git().add('*')
    // Add the changes to the commit
    await git().commit('Add initial files')

    console.log(`${chalk.green('Success!')} 🎉`)
    console.log()

    console.log(
      `${chalk.cyan('cd')} into ${chalk.green(this.name)} and start developing!`
    )
    console.log()

    return exe
  }
}

export default function generator(name: string, framework: string) {
  return new Generator(name, framework)
}
