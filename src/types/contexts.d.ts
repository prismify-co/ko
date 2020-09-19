export interface CreateContext {
  name: string
  path: string
  framework: string
  version?: string
  typescript?: boolean
  offline: boolean
  git: boolean
}

export interface InstallContext {
  name: string
  dryRun: boolean
  host: string
  cache: boolean
  offline: boolean
  git: boolean
}
