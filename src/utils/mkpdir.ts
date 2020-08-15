import { mkdir } from 'shelljs'
import { resolve } from 'path'

/**
 * Creates a project directory only if the project is not the cwd
 */
export function mkpdir(name: string) {
  if (name === '.') {
    return
  }

  return mkdir('-p', resolve(name))
}
