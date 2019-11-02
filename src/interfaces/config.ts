import { IFrameworkKind } from './framework'

// IConfig defines the configuration
// after it was normalized
export interface IConfig {
  readonly name: string,
  readonly framework: IFramework
  readonly repository: IRepository
  readonly tasks: ITask[] | string
}

export type IFramework = ({
  name: string,
  version: string,
})

export type IRepository = ({
  name: string,
  url: string
})

export type ITask = ({
  name: string,
  task: IPackage
})

export type IPackage = ({
  name: string,
  url: string,
  version: string
})

// IUserConfig defines the configuration
// that user may have entered in a certain format
export interface IUserConfig {
  name: string,
  framework: IUserFramework
  repository?: IUserRepository | string
  tasks: IUserTask[] | string
}

export type IUserFramework = ({
  name: IFrameworkKind,
  version: string,
}) & ({ [framework in IFrameworkKind]: ({ version: string }) | string }) | string

export type IUserRepository = ({
  name: string,
  url: string
})

export type IUserTask = ({
  // Name or description of the task
  name: string,
  task: IUserPackage | string
})

export type IUserPackage = ({
  name?: string,
  url?: string,
  version?: string
}) & ({ [name: string]: { url?: string, version?: string } })

export interface IConfigInitOptions {
  name: string,
  path?: string,
  framework: IFramework
}
