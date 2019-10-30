import * as fs from 'fs'
import * as yml from 'js-yaml'
import {join} from 'path'
export const CASTLE_CONFIG_FILENAME = 'castle.config.yml'

export function exists(path: string = process.cwd()): boolean {
  return fs.existsSync(join(path, CASTLE_CONFIG_FILENAME))
}

export function init(name: string, framework: string, version: string) {
  if (exists()) {
    return
  }

  return fs.writeFileSync(join(process.cwd(), CASTLE_CONFIG_FILENAME), yml.dump({
    name,
    framework: {
      [framework]: {
        version
      }
    }
  }, {flowLevel: 3}), 'utf8')
}

export function load() {
  if (!exists()) throw new Error('Configuration file does not exist.')
  return yml.safeLoad(fs.readFileSync(join(process.cwd(), CASTLE_CONFIG_FILENAME), 'utf8'))
}
