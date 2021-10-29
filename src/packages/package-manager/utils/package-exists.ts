import {existsSync, JSONLike, read, readSync} from "../../utils/fs";
import {resolve} from "path";
import {complement, equals, identity, ifElse, isNil, lensPath, or, pipe, tryCatch, view} from "rambda";
import {ifElseAsync, pipeAsync, tryCatchAsync} from 'rambdax'

/**
 * Determines whether a package exists in a json
 * @param name
 */
export const packageExistsSync = (name: string) => {
  const pkgPath = resolve('package.json')
  const getName = view(lensPath(name))
  const hasName = pipe(getName, complement(isNil))
  return tryCatch(pipe(existsSync, ifElse(
    equals(true),
    () => pipe(
      readSync,
      JSON.parse,
      ({devDependencies: dev, dependencies: deps}: JSONLike) =>
        or(hasName(dev), hasName(deps))
    )(pkgPath),
    identity
  )), () => false)(pkgPath)
}

export const packageExists = (name: string): Promise<boolean> => {
  const pkgPath = resolve('package.json')
  const getName = view(lensPath(name))
  const hasName = pipe(getName, complement(isNil))
  return tryCatchAsync<() => boolean>(pipeAsync(
    existsSync, ifElseAsync(
    async x => equals(await x, true),
    () => pipeAsync(
      read,
      async x => JSON.parse(await x),
      async (x: Promise<JSONLike>) =>  {
        const {devDependencies: dev, dependencies: deps} = (await x)
          return or(hasName(dev), hasName(deps))
      }
    )(pkgPath),
      (x) => Promise.resolve(x)
  )), () => false)(pkgPath) as unknown as Promise<boolean>
}
