export interface IConfig {
  name: string,
  framework: IFramework
  repository?: IRepository | string
  tasks: ITask[] | string
}

export type IFramework = ({
  name: string,
  version: string,
}) | ({ [name: string]: { version: string } }) | string

export type IRepository = ({
  url: string
})

export type ITask = ({
  name: string,
  package: IPackage | string
})

export type IPackage = ({
  name: string,
  url: string,
  version: string
}) | ({ [name: string]: { url: string, version: string } })
