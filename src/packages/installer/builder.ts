import merge = require('lodash/merge')

import executor from './executor'
import {
  DependencyConfig,
  FileConfig,
  RecipeMeta,
  StepsConfig,
  TransformConfig,
} from './types'

export type BuilderOptions = {
  cwd?: string
}

export class Builder {
  #meta: RecipeMeta = {
    name: '',
    description: '',
    owner: '',
    repo: {
      link: '',
    },
  }
  #options: BuilderOptions
  #steps: StepsConfig[] = []

  constructor(options: BuilderOptions = {}) {
    this.#options = options
  }

  setName(name: string) {
    this.#meta.name = name
    return this
  }
  setDescription(description: string) {
    this.#meta.description = description
    return this
  }
  setOwner(owner: string) {
    this.#meta.owner = owner
    return this
  }
  setRepo(repo: Partial<RecipeMeta>) {
    this.#meta.repo = merge(this.#meta.repo, repo)
    return this
  }
  addFileStep(step: Omit<FileConfig, 'type'>) {
    this.#steps.push({
      type: 'file',
      ...step,
    })
    return this
  }
  addDependencyStep(step: Omit<DependencyConfig, 'type'>) {
    this.#steps.push({
      type: 'dependency',
      ...step,
    })
    return this
  }
  addTransformStep(step: Omit<TransformConfig, 'type'>) {
    this.#steps.push({
      type: 'transform',
      ...step,
    })
    return this
  }

  build() {
    return executor(this.#steps, this.#meta, this.#options)
  }
}

export default function builder(options?: BuilderOptions) {
  return new Builder(options)
}
