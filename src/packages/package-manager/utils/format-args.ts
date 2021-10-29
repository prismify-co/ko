import {PackageManagerCommand, PackageManagerType} from "../types";
import {always, cond, equals, pipe, T} from "rambda";

type FormatArgsOptions = {
  dev?: boolean
  offline?: boolean
}


type FormatFunction = (options: FormatArgsOptions) => ArgsFunction
type ArgsFunction = (args: string[]) => CommandFunction
type CommandFunction = (command: PackageManagerCommand) => string[]

const format = (offlineArgs: string[]) => (devArgs: string[]): ArgsFunction => (args) => {
  const command: CommandFunction = cond<PackageManagerCommand, string[]>([
    [equals<PackageManagerCommand>('add'), always(['add', ...args, ...devArgs, ...offlineArgs])],
    [equals<PackageManagerCommand>('remove'), always(['remove', ...args, ...offlineArgs])],
    [equals<PackageManagerCommand>('run'), always(['run', ...args])],
    [T, always([])]
  ])

  return command
}


function formatNpm({dev, offline}: FormatArgsOptions = {}) {
  const offlineArgs = !!offline ? ['--prefer-offline'] : []
  const devArgs = !!dev ? ['--save-dev'] : []

  return format(offlineArgs)(devArgs)
}

function formatYarn({dev, offline}: FormatArgsOptions = {}) {
  const offlineArgs = !!offline ? ['--offline'] : []
  const devArgs = !!dev ? ['--dev'] : []
  return format(offlineArgs)(devArgs)
}


export const formatArgs = (manager: PackageManagerType, command: PackageManagerCommand, args: string[], options: FormatArgsOptions = {}): string[] => {

  const applyFormat = (formatter: FormatFunction) => pipe(
    (f: FormatFunction) => f(options),
    (f: ArgsFunction) => f(args),
    f => f(command)
  )(formatter)

  return cond<PackageManagerType, string[]>([
    [equals<PackageManagerType>('npm'), always(applyFormat(formatNpm))],
    [equals<PackageManagerType>('yarn'), always(applyFormat(formatYarn))],
    [T, always([])]
  ])(manager)
}
