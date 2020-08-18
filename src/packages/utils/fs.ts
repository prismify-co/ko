import { readFileSync, PathLike, writeFileSync } from 'fs'
import { URL } from 'url'
import { join } from 'path'

export { existsSync as exists } from 'fs'
/**
 * Synchronously reads the entire contents of a file.
 * @param path A path to a file. If a URL is provided, it must use the file: protocol. URL support is experimental. If a file descriptor is provided, the underlying file will not be closed automatically.
 * @param options An object that may contain an optional flag. If a flag is not provided, it defaults to 'r'
 */
export const read = (path: string | number | Buffer | URL, options: any = {}) =>
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
export const write = (
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
 * @param options An object that may contain an optional flag. If a flag is not provided, it defaults to 'r'
 */
export const readJSON = (path: string) => JSON.parse(read(path)) as JSONLike

/**
 * Synchronously writes data to a file, replacing the file if it already exists.
 * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
 * URL support is _experimental_.
 * If a file descriptor is provided, the underlying file will _not_ be closed automatically.
 * @param data The data to write. If something other than a Buffer or Uint8Array is provided, the value is coerced to a string.
 */
export const writeJSON = (path: PathLike | string, data: JSONLike) =>
  write(path, JSON.stringify(data))
