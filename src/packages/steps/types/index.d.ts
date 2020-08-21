// import {
//   ExecutorConfig,
//   DependencyConfig,
//   FileConfig,
//   TransformConfig,
//   CustomConfig,
// } from '@ko/executor/types'

import {
  ExecutorConfig,
  DependencyConfig,
  FileConfig,
  TransformConfig,
  CustomConfig,
} from '../../executor/types'

export type StepsConfig =
  | ExecutorConfig
  | DependencyConfig
  | FileConfig
  | TransformConfig
  | CustomConfig
