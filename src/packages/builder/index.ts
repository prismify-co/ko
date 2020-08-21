// import Executor from '@ko/executor'
import { merge } from 'lodash'
import Steps from '../steps'
import Executor from '../executor'
// import Steps from '@ko/steps'

export type BuilderOptions = {
  cwd?: string
}

export interface RecipeMeta {
  name: string
  description: string
  owner: string
  repo: RepoMeta
}

export interface RepoMeta {
  link: string
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
  protected options: BuilderOptions
  constructor(options: BuilderOptions = {}) {
    super()
    this.options = options
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
    return new Executor(this._steps, this.options)
  }
}

export default function builder(options?: BuilderOptions) {
  return new Builder(options)
}
