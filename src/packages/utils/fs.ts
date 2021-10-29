import {constants, PathLike, readFileSync, writeFileSync} from 'fs'
import {join} from 'path'
import { promises as fs } from "fs";
import {tryCatchAsync} from "rambdax";
export { existsSync } from 'fs'
const {access, readFile}  = fs
/**
 * Test whether or not the given path exists by checking with the file system.
 * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
 */
export const exists: (path: PathLike) => Promise<boolean> = tryCatchAsync(async (path: PathLike) => {
  await access(path, constants.F_OK)
  return true
}, false)


/**
 * Asynchronously reads the entire contents of a file.
 * @param path A path to a file. If a URL is provided, it must use the file: protocol. URL support is experimental. If a file descriptor is provided, the underlying file will not be closed automatically.
 * @param options An object that may contain an optional flag. If a flag is not provided, it defaults to 'r'
 */
export const read = (path: PathLike, options: any = {}): Promise<string> => {
  return readFile(path, options).then(value => value.toString('utf-8'))
}

/**
 * Synchronously reads the entire contents of a file.
 * @param path A path to a file. If a URL is provided, it must use the file: protocol. URL support is experimental. If a file descriptor is provided, the underlying file will not be closed automatically.
 * @param options An object that may contain an optional flag. If a flag is not provided, it defaults to 'r'
 */
export const readSync = (path: PathLike | number, options: any = {}) =>
  readFileSync(path, options).toString('utf-8')

/**
 * Synchronously writes data to a file, replacing the file if it already exists.
 * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
 * URL support is _experimental_.
 * If a file descriptor is provided, the underlying file will _not_ be closed automatically.
 * @param data The data to write. If something other than a Buffer or Uint8Array is provided, the value is coerced to a string.
 * @param options Either the encoding for the file, or an object optionally specifying the encoding, file mode, and flag.
 * If `encoding` is not supplied, the default of `'utf8'` is used.
 * If `mode` is not supplied, the default of `0o666` is used.
 * If `mode` is a string, it is parsed as an octal integer.
 * If `flag` is not supplied, the default of `'w'` is used.
 */
export const writeSync = (
  path: PathLike | string,
  data:
    | string
    | Uint8Array
    | Uint8ClampedArray
    | Uint16Array
    | Uint32Array
    | Int8Array
    | Int16Array
    | Int32Array
    | Float32Array
    | Float64Array
    | DataView,
  options: any = {}
) => writeFileSync(path, data, options)

export interface JSONLike {
  [x: string]: string | number | boolean | Date | JSON | JSONLikeArray | {}
}

export interface JSONLikeArray
  extends Array<string | number | boolean | Date | JSON | JSONLikeArray> {}
/**
 * Synchronously reads the entire contents of a JSON file.
 * @param path A path to a file. If a URL is provided, it must use the file: protocol. URL support is experimental. If a file descriptor is provided, the underlying file will not be closed automatically.
 */
export const readJSONSync = (...path: string[]) =>
  JSON.parse(readSync(join(...path))) as JSONLike

/**
 * Synchronously writes data to a file, replacing the file if it already exists.
 * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
 * URL support is _experimental_.
 * If a file descriptor is provided, the underlying file will _not_ be closed automatically.
 * @param data The data to write. If something other than a Buffer or Uint8Array is provided, the value is coerced to a string.
 */
export const writeJSONSync = (path: PathLike | string, data: JSONLike) =>
  writeSync(path, JSON.stringify(data))
