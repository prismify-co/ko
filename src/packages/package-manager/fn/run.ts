import {PackageManagerCommand, PackageManagerType} from "../types";
import {formatArgs} from "../utils/format-args";
import execa from "execa";
import {isEmpty} from "rambda";

export interface RunOptions {
  manager: PackageManagerType
  command: PackageManagerCommand,
  args: string[]
  flags?: {
    dev?: boolean,
    offline?: boolean
  }
  cwd: string
}

export async function run({manager, command, cwd, args, flags = {}}: RunOptions): Promise<void> {
  if (isEmpty(args)) return
  await execa(manager, formatArgs(manager, command, args, flags), { cwd })
}

export function runSync({manager, command, cwd, args, flags = {}}: RunOptions) {
  if (isEmpty(args)) return
  execa.sync(manager, formatArgs(manager, command, args, flags), { cwd })
}
