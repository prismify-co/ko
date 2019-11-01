import * as config from '../utils/config'
import { join } from 'path'
import { exec, cd } from 'shelljs'
import { ITaskRunner } from '../interfaces/task-runner'

// import {start} from './task-manager'
export default async function () {
  const cwd = process.cwd()
  // Load the configuration
  const koConfig = config.load()

  // Install the repository
  exec(`yarn add -D ${koConfig.repository.url}`)

  // Find the name of the package
  const pkg = require(join(process.cwd(), 'package.json'))
  const dev = pkg.devDependencies
  const keys = Object.keys(dev)
  let pkgName = ''
  for (const key of keys) {
    if (dev[key] === koConfig.repository.url) {
      pkgName = key
    }
  }

  // Import the tasks
  if (Array.isArray(koConfig.tasks)) {
    const tasks = koConfig.tasks.forEach(async (item, index) => {
      if (item.task.url !== koConfig.repository.url) {
        return index
      }
      const path = join(process.cwd(), 'node_modules', pkgName, item.task.name, koConfig.framework.name)
      cd(path)
      exec('yarn')
      let runner = (await import(path))
      runner = (runner.default ? runner.default : runner) as ITaskRunner
      cd(cwd)
      process.chdir(cwd)
      runner({ version: item.task.version, command: 'install' })
    })
  }
}
