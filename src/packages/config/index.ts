import { existsSync as exists, writeFile } from 'fs'
import { resolve } from 'path'
import { write } from '@ko/utils/fs'

export const KO_CONFIG_FILENAME = 'ko.config.json'
export const KO_CONFIG_REPOSITORY_NAME = '@prismify/ko-tasks'
export const KO_CONFIG_REPOSITORY_URL =
  'https://github.com/prismify-co/ko-tasks'

export const KO_CONFIG_CURRENT_REPOSITORY_URL = KO_CONFIG_REPOSITORY_URL

export type Framework = 'nuxt' | 'next' | 'sapper'

export type ConfigOptions = {
  name: string
  framework: { name: Framework; version: 'latest' | string }
}

class Config {
  #options: ConfigOptions
  constructor(options: ConfigOptions) {
    this.#options = options
  }
  async init() {
    const path = resolve(KO_CONFIG_FILENAME)
    if (exists(path)) {
      return
    }

    return write(
      path,
      JSON.stringify({
        name: this.#options.name,
        framework: {
          name: this.#options.framework,
          version: 'current',
        },
        recipes: [],
      })
    )
  }
}

export default function config(options: ConfigOptions) {
  return new Config(options)
}
