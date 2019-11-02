export type ITaskRunner = (options: ITaskRunnerOptions) => void

export interface ITaskRunnerOptions {
  version?: string,
  path?: string,
  command: 'install' | 'uninstall'
}
