import { join } from 'path'
import { mkdir, rm } from 'shelljs'
import tempdir from 'temp-dir'
import { platform, tmpdir } from 'os'

/**
 * Returns the test directory.
 * @param paths The path which is followed by the test directory
 */
export const testdir = (...paths: string[]) =>
  join(platform() === 'win32' ? tmpdir() : tempdir, 'ko-test', ...paths)
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
 * Changes to test directory
 * @param path The paths which is followed by the test directory
 */
export const chtestdir = (...paths: string[]) =>
  process.chdir(testdir(...paths))
