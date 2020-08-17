import { resolve } from 'path'
import { mkdir } from 'shelljs'

/**
 * Creates a project directory only if the project is not the cwd
 */
export function mkpdir(name: string) {
  if (name === '.') {
    return
  }

  return mkdir('-p', resolve(name))
}
