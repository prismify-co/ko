import {PackageManagerType} from "../types";
import {exists, existsSync} from "../../utils/fs";
import {resolve} from "path";

/**
 * Determines which package manager is used asynchronously.
 */
export async function which(): Promise<PackageManagerType> {
  const result = await exists(resolve('yarn.lock'))
  return result ? 'yarn' : 'npm'
}

/**
 * Determines which package manager is used synchronously.
 */
export function whichSync(): PackageManagerType {
  const result = existsSync(resolve('yarn.lock'))
  return result ? "yarn" : 'npm'
}
