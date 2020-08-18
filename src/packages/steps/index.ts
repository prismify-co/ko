import {
  RecipeMeta,
  StepsConfig,
  CustomConfig,
  FileConfig,
  DependencyConfig,
  TransformConfig,
} from '../builder/types'
import { BuilderOptions } from '../builder'

export default class Steps {
  protected steps: StepsConfig[] = []
  protected options: BuilderOptions

  constructor(options: BuilderOptions = {}) {
    this.options = options
  }

  addCustomStep(step: Omit<CustomConfig, 'type'>) {
    this.steps.push({
      type: 'custom',
      ...step,
    })
    return this
  }

  addFileStep(step: Omit<FileConfig, 'type'>) {
    this.steps.push({
      type: 'file',
      ...step,
    })
    return this
  }
  addDependencyStep(step: Omit<DependencyConfig, 'type'>) {
    this.steps.push({
      type: 'dependency',
      ...step,
    })
    return this
  }
  addTransformStep(step: Omit<TransformConfig, 'type'>) {
    this.steps.push({
      type: 'transform',
      ...step,
    })
    return this
  }
}
