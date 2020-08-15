import { readFile, writeFile } from 'fs'
import globby from 'globby'
import handlebars from 'handlebars'
import { merge } from 'lodash'
import pkgm from '../../packages/package-manager'
import git, { CommitSummary } from 'simple-git'
import { promisify } from 'util'

import { processFile } from './transform'
import {
  DependencyConfig,
  FileConfig,
  RecipeMeta,
  StepsConfig,
  TransformConfig,
} from './types'
const writeFileAsync = promisify(writeFile)
const readFileAsync = promisify(readFile)

export type ExecutorOptions = {
  cwd?: string
  dryRun?: boolean
}

export class Executor {
  #steps: StepsConfig[]
  #meta: RecipeMeta
  #options: ExecutorOptions
  #commits: CommitSummary[] = []
  constructor(
    steps: StepsConfig[],
    meta: RecipeMeta,
    options: ExecutorOptions
  ) {
    this.#steps = steps
    this.#meta = meta
    this.#options = merge(options, { cwd: process.cwd() })
  }

  setOptions(options: ExecutorOptions) {
    this.#options = merge(this.#options, { cwd: process.cwd() }, options)
    return this
  }

  async run() {
    await this.#installPackages()
    await this.#createFiles()
    await this.#transformFiles()
    return this
  }

  #installPackages = async () => {
    const dependencies = this.#steps.filter(
      (step) => step.type === 'dependency'
    ) as DependencyConfig[]
    dependencies.forEach(async (d) => {
      if (d.packages.length > 0) {
        // Install the packages
        pkgm().add(d.packages, { cwd: this.#options.cwd })
        // Commit the changes
        this.#commits.push(await git(this.#options.cwd).commit(d.explanation))
      }
    })
  }

  #transformFiles = async () => {
    const transforms = this.#steps.filter(
      (step) => step.type === 'transform'
    ) as TransformConfig[]
    transforms.forEach(async (t) => {
      for await (const path of globby.stream(t.files, {
        cwd: this.#options.cwd,
      })) {
        const original = (await readFileAsync(path)).toString('utf-8')
        const processed = processFile(original, t.transform)
        await writeFileAsync(path, processed, 'utf-8')
        this.#commits.push(await git(this.#options.cwd).commit(t.explanation))
      }
    })
  }

  #createFiles = async () => {
    const files = this.#steps.filter(
      (step) => step.type === 'file'
    ) as FileConfig[]
    files.forEach(async (f) => {
      for await (const path of globby.stream(f.path, {
        cwd: this.#options.cwd,
      })) {
        let file = (await readFileAsync(path)).toString('utf-8')

        if (f.context) {
          const template = handlebars.compile(file)
          file = template(f.context)
        }
        await writeFileAsync(file, path, 'utf-8')
      }
    })
  }
}

export default function executor(
  steps: StepsConfig[] = [],
  meta: RecipeMeta,
  options: ExecutorOptions
) {
  return new Executor(steps, meta, options)
}
