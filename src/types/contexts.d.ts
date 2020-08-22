export interface CreateContext {
  name: string
  framework: string
  version?: string
  typescript?: boolean
  offline: boolean
}

export interface InstallContext {
  name: string
  dryRun: boolean
  host: string
  cache: boolean
  offline: boolean
}
