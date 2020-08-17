import { readdirSync } from 'fs'

export function isDirEmpty(path: string) {
  return readdirSync(path).length === 0
}

/**
 * Determines whether the current working directory is clean
 */
export default async function checkcwd(): Promise<boolean> {
  return isDirEmpty(process.cwd())
}
