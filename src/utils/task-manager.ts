import { cli } from 'cli-ux'
import { join } from 'path'
import { cd, exec } from 'shelljs'

import { IConfig } from '../interfaces/config'
import { ITaskRunner } from '../interfaces/task-runner'

export function manage(config: IConfig) {
  if (Array.isArray(config.tasks)) {
    config.tasks.forEach(async item => {
      if (item.task.url !== config.repository.url) {
        // TODO: Handle tasks that have a different url
      }
      // Save the current root directory
      const rootDir = process.cwd()
      // Create the path to node_modules
      const nodeModules = join(rootDir, 'node_modules')
      // Create the path to the task's directory
      const taskDir = join(config.repository.name, item.task.name, config.framework.name)
      // Create the full path
      const path = join(nodeModules, taskDir)
      // Install the task's dependencies
      cd(path)
      exec('yarn -s')
      // Import the task
      let runner = (await import(path))
      runner = (runner.default ? runner.default : runner) as ITaskRunner
      // Move back up to the root directory
      cd(rootDir)
      // Start the runner
      cli.action.start(item.name.toLowerCase(), undefined, { stdout: true })
      await runner({ version: item.task.version, command: 'install' })
      cli.action.stop()
    })
  }
}
