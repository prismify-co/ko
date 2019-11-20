import * as child_process from 'child_process'
import { cli } from 'cli-ux'
import { join } from 'path'
import { promisify } from 'util'

import { IConfig } from '../interfaces/config'
import { ITaskRunner } from '../interfaces/task-runner'
const exec = promisify(child_process.exec)

export function manage(config: IConfig) {
  // Save the current root directory
  const rootDir = process.cwd()
  if (Array.isArray(config.tasks)) {
    config.tasks.forEach(async item => {
      if (item.task.url !== config.repository.url) {
        // TODO: Handle tasks that have a different url
      }

      // Create the path to node_modules
      const nodeModules = join(rootDir, 'node_modules')
      // Create the path to the task's directory
      const taskDir = join(config.repository.name, item.task.name, config.framework.name)
      // Create the full path
      const path = join(nodeModules, taskDir)
      // Install the task's dependencies
      process.chdir(path)
      await exec('yarn --force -s')
      // Import the task
      let runner = (await import(path))
      runner = await (runner.default ? runner.default : runner) as ITaskRunner
      // Move back up to the root directory
      process.chdir(path)
      // Start the runner
      cli.action.start(item.name.toLowerCase(), undefined, { stdout: true })
      await runner({ version: item.task.version, command: 'install' })
      cli.action.stop()
    })
  }
}
