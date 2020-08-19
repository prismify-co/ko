import {
  ExecutorConfig,
  DependencyConfig,
  FileConfig,
  TransformConfig,
  CustomConfig,
} from '@ko/executor/types'

export type StepsConfig =
  | ExecutorConfig
  | DependencyConfig
  | FileConfig
  | TransformConfig
  | CustomConfig
