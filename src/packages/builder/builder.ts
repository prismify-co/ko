import executor from './executor'
import {
  DependencyConfig,
  FileConfig,
  RecipeMeta,
  StepsConfig,
  TransformConfig,
  CustomConfig,
} from './types'
import { merge } from 'lodash'
import { Steps } from './steps'

export type BuilderOptions = {
  cwd?: string
}

export class Builder extends Steps {
  meta: RecipeMeta = {
    name: '',
    description: '',
    owner: '',
    repo: {
      link: '',
    },
  }

  constructor(options: BuilderOptions = {}) {
    super(options)
  }

  setName(name: string) {
    this.meta.name = name
    return this
  }
  setDescription(description: string) {
    this.meta.description = description
    return this
  }
  setOwner(owner: string) {
    this.meta.owner = owner
    return this
  }
  setRepo(repo: Partial<RecipeMeta>) {
    this.meta.repo = merge(this.meta.repo, repo)
    return this
  }

  build() {
    return executor(this.steps, this.options)
  }
}

export default function builder(options?: BuilderOptions) {
  return new Builder(options)
}
