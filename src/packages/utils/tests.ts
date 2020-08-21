import { join } from 'path'
import { tempdir, mkdir, rm, cp } from 'shelljs'

/**
 * Returns the test directory.
 * @param paths The path which is followed by the test directory
 */
export const testdir = (...paths: string[]) =>
  join(tempdir(), 'ko-test', ...paths)
/**
 * Creates the test directory.
 * @param paths The path which is followed by the test directory
 */
export const mktestdir = (...paths: string[]) => mkdir('-p', testdir(...paths))
/**
 * Removes the test directory.
 */
export const rmtestdir = (...paths: string[]) => rm('-rf', testdir(...paths))
/**
 * Removes and creates the test directory.
 */
export const rmmktestdir = (...paths: string[]) => {
  rmtestdir(...paths)
  mktestdir(...paths)
}

/**
 *
 * @param path
 * @param destination The destination path which is followed by the test directory.
 */
export const cptestdir = (path: string | string[], ...destination: string[]) =>
  cp('-r', path, testdir(...destination))

/**
 * Changes to test directory
 * @param path The paths which is followed by the test directory
 */
export const chtestdir = (...paths: string[]) =>
  process.chdir(testdir(...paths))
