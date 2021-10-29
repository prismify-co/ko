export interface NPMPackage {
  name: string
  version?: string
  dev?: boolean
}

export type PackageManagerType = 'npm' | 'yarn'

export type PackageManagerCommand = 'add' | 'remove' | 'run'
