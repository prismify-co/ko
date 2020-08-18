import { Transformer } from '@ko/transformer/types'
import { NPMPackage } from '@ko/package-manager/types'

interface Context {
  [x: string]: string | number | boolean | Context
}

export type ExecutionType = 'dependency' | 'transform' | 'file' | 'custom'

export interface ExecutorConfig {
  /**
   * The name of the step
   */
  name: string
  /**
   * The type of step
   */
  type: ExecutionType
  /**
   * A summary of the current step
   */
  summary?: string
  /**
   * The condition when a step should be able to run. (e.g. when a condition is false, the step will not execute)
   */
  condition?: boolean
}
export interface DependencyConfig extends ExecutorConfig {
  packages: (string | NPMPackage)[]
}

export interface FileConfig extends ExecutorConfig {
  /**
   * The target directory
   */
  target: string
  /**
   * The path of the template file
   */
  path: string
  /**
   * The handlebar context values
   */
  context?: Context
}

export interface TransformConfig extends ExecutorConfig {
  files: string[]
  transform: Transformer
}

export interface CustomConfig extends ExecutorConfig {
  run: (() => void) | (() => Promise<void>)
}

export type StepsConfig =
  | ExecutorConfig
  | DependencyConfig
  | FileConfig
  | TransformConfig
  | CustomConfig

export interface RecipeMeta {
  name: string
  description: string
  owner: string
  repo: RepoMeta
}

export interface RepoMeta {
  link: string
}
