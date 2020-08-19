import {
  StepsConfig,
  CustomConfig,
  FileConfig,
  DependencyConfig,
  TransformConfig,
} from '@ko/builder/types'

export default class Steps {
  protected _steps: StepsConfig[] = []

  get steps() {
    return this._steps
  }

  addCustomStep(step: Omit<CustomConfig, 'type'>) {
    this._steps.push({
      type: 'custom',
      ...step,
    })
    return this
  }

  addFileStep(step: Omit<FileConfig, 'type'>) {
    this._steps.push({
      type: 'file',
      ...step,
    })
    return this
  }
  addDependencyStep(step: Omit<DependencyConfig, 'type'>) {
    this._steps.push({
      type: 'dependency',
      ...step,
    })
    return this
  }
  addTransformStep(step: Omit<TransformConfig, 'type'>) {
    this._steps.push({
      type: 'transform',
      ...step,
    })
    return this
  }
}
