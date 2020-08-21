// import { NPMPackage } from '@ko/package-manager/types'

import { NPMPackage } from '../../package-manager/types'
import { Transformer } from '../../transformer/types'
// import { Transformer } from '@ko/transformer/types'
export type ExecutionType = 'dependency' | 'transform' | 'file' | 'custom'

interface Context {
  [x: string]: string | number | boolean | Context
}

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
  destination: string
  /**
   * The path of the template file
   */
  source: string | string[]
  /**
   * The handlebar context values
   */
  context?: Context
}

export interface TransformConfig extends ExecutorConfig {
  source: string | string[]
  transform: Transformer
}

export interface CustomConfig extends ExecutorConfig {
  run: (() => void) | (() => Promise<void>)
}
