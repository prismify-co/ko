import * as fs from 'fs'
import * as yml from 'js-yaml'
import { join } from 'path'

import { IConfig, IPackage } from '../interfaces/config'

export const KO_CONFIG_FILENAME = 'ko.config.yml'
export const KO_CONFIG_REPOSITORY_URL = 'https://www.github.com/prismify-co/ko-packages/'

export let KO_CONFIG_CURRENT_REPOSITORY_URL = KO_CONFIG_REPOSITORY_URL

export function exists(path: string = process.cwd()): boolean {
  return fs.existsSync(join(path, KO_CONFIG_FILENAME))
}

export function init(name: string, framework: string, version: string) {
  if (exists()) {
    return
  }

  return fs.writeFileSync(join(process.cwd(), KO_CONFIG_FILENAME), yml.dump({
    name,
    framework: {
      name: framework,
      version
    }
  }, { flowLevel: 3 }), 'utf8')
}

export function load(): IConfig {
  if (!exists()) throw new Error('Configuration file does not exist.')
  return normalize(yml.safeLoad(fs.readFileSync(join(process.cwd(), KO_CONFIG_FILENAME), 'utf8')) as IConfig)
}

function normalize(config: IConfig): IConfig {
  // Set the app name
  let result: any = { name: config.name }

  // Normalize the framework if it's as string
  if (typeof config.framework === 'string') {
    result.framework = { name: config.framework, version: 'latest' }
  } else result.framework = config.framework

  // Normalize the repository's base url if it's a string
  if (typeof config.repository === 'string') {
    result.repository = { url: config.repository }
  } else result.repository = (config.repository || {})

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
      if (!task.task.name) {
        const key = Object
          .keys(task.task)
          .filter(k => k !== 'version' && k !== 'url')[0]
        let value = (task.task as any)[key] as IPackage
        let url = value.url || KO_CONFIG_CURRENT_REPOSITORY_URL
        let version = value.version || 'latest'
        return { name: task.name, task: { name: key, url, version } }
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

      return task
    })
  } else result.tasks = config.tasks

  return result
}
