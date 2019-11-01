import { existsSync, readFileSync, writeFileSync } from 'fs'
import * as yml from 'js-yaml'
import { join } from 'path'

import { IConfig, IConfigInitOptions, IUserConfig, IUserPackage, IUserTask } from '../interfaces/config'
import { IFrameworkKind } from '../interfaces/framework'

export const KO_CONFIG_FILENAME = 'ko.config.yml'
export const KO_CONFIG_REPOSITORY_URL = 'https://www.github.com/prismify-co/ko-tasks/'

export let KO_CONFIG_CURRENT_REPOSITORY_URL = KO_CONFIG_REPOSITORY_URL

export function init(options: IConfigInitOptions) {
  // Normalize the path
  const path = (options.path || process.cwd()).replace(KO_CONFIG_FILENAME, '')
  // Check if the file exist
  if (existsSync(join(path, KO_CONFIG_FILENAME))) {
    return
  }
  return writeFileSync(join(path, KO_CONFIG_FILENAME), yml.dump({
    name: options.name,
    framework: options.framework
  }, { flowLevel: 3 }), 'utf8')
}

export function load(path: string = process.cwd()): IConfig {
  // Normalize the path
  const configPath = path.replace(KO_CONFIG_FILENAME, '')
  if (!existsSync(configPath)) throw new Error('Configuration file does not exist.')
  return normalize(yml.safeLoad(readFileSync(join(configPath, KO_CONFIG_FILENAME), 'utf8')) as IUserConfig)
}

export function normalize(config: IUserConfig): IConfig {
  // Set the app name
  let result: any = { name: config.name }

  // Normalize the framework if it's as string
  if (typeof config.framework === 'string') {
    result.framework = { name: config.framework, version: 'latest' }
  } else {
    const keys = Object.keys(config.framework)
    if (keys.length > 0 && !config.framework.name && !config.framework.version) {
      const key = keys.filter(key => key !== 'name' && key !== 'version')[0] as IFrameworkKind
      const value = config.framework[key]
      let version = 'latest'
      if (typeof value === 'string') {
        version = value
      } else if (value.version) {
        version = value.version
      }

      result.framework = {
        name: key,
        version
      }
    } else if (config.framework.name && config.framework.version) {
      result.framework = config.framework
    }
  }

  // Normalize the repository's base url if it's a string
  if (typeof config.repository === 'string') {
    result.repository = { url: config.repository || KO_CONFIG_REPOSITORY_URL }
  } else result.repository = (config.repository || {
    url: KO_CONFIG_REPOSITORY_URL
  })

  KO_CONFIG_CURRENT_REPOSITORY_URL = result.repository.url || KO_CONFIG_REPOSITORY_URL

  // Normalize the tasks
  if (typeof config.tasks === 'object' && Array.isArray(config.tasks)) {
    result.tasks = config.tasks.map(task => {
      if (!task.name) {
        throw new Error('Task name was not provided')
      }
      // Normalize the package if it's a string
      if (typeof task.task === 'string') {
        return {
          name: task.name, task: {
            name: task.task,
            url: KO_CONFIG_CURRENT_REPOSITORY_URL,
            version: 'latest'
          }
        }
      }

      // The package could be an object that
      // the name of the package to run is the key
      if (!task.task.name && !task.task.url && !task.task.version) {
        const key = Object
          .keys(task.task)
          .filter(k => k !== 'version' && k !== 'url')[0]
        let value = (task.task as any)[key] as IUserPackage
        let url = (value.url || KO_CONFIG_CURRENT_REPOSITORY_URL) as string
        let version = (value.version || 'latest') as string
        // Normalize versions
        version = version.replace('v', '')
        return { name: task.name, task: { name: key, url, version } } as IUserPackage
      }

      if (!task.task.name) {
        throw new Error('Task name was not provided')
      }

      if (!task.task.url) {
        task.task.url = KO_CONFIG_CURRENT_REPOSITORY_URL
      }

      if (!task.task.version) {
        task.task.version = 'latest'
      }

      return task as IUserTask
    })
  } else result.tasks = config.tasks || []

  return (result as IConfig)
}
