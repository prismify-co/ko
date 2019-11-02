import { existsSync } from 'fs'
import { join } from 'path'
import { mkdir, rm } from 'shelljs'

import { IConfig, IConfigInitOptions, ITask, IUserConfig } from '../../interfaces/config'
import { init, KO_CONFIG_REPOSITORY_NAME, KO_CONFIG_REPOSITORY_URL, load, normalize } from '../config'

const yaml = require('yaml-template')

describe('utils/config', () => {
  beforeAll(() => {
    // Create an output directory
    mkdir(join(__dirname, 'output'))
  })
  afterAll(() => {
    // Remove output directory
    rm('-rf', join(__dirname, 'output'))
  })

  describe('init()', () => {
    it('should initalize a configuration file', () => {
      init({
        name: 'app',
        path: join(__dirname, 'output'), framework: {
          name: 'nuxt',
          version: 'latest'
        }
      } as IConfigInitOptions)
      expect(existsSync(join(__dirname, 'output', 'ko.config.yml'))).toBe(true)
    })
  })

  describe('load()', () => {
    it('should load the configuration file', () => {
      const config = load(join(__dirname, 'output'))

      expect(config).toStrictEqual({
        name: 'app',
        framework: {
          name: 'nuxt',
          version: 'latest'
        },
        repository: {
          name: KO_CONFIG_REPOSITORY_NAME,
          url: KO_CONFIG_REPOSITORY_URL
        },
        tasks: []
      } as IConfig)
    })
  })

  describe('normalize()', () => {
    it('should normalize the configuration', () => {
      const configA = {
        name: 'app',
        framework: {
          name: 'nuxt',
          version: 'latest'
        },
        repository: {
          name: KO_CONFIG_REPOSITORY_NAME,
          url: KO_CONFIG_REPOSITORY_URL
        },
        tasks: []
      } as IConfig

      const configB = {
        name: 'app',
        framework: {
          name: 'nuxt',
          version: 'latest'
        },
        repository: {
          name: KO_CONFIG_REPOSITORY_NAME,
          url: KO_CONFIG_REPOSITORY_URL
        },
        tasks: [
          {
            name: 'A',
            task: {
              name: 'tailwindcss',
              version: 'latest',
              url: KO_CONFIG_REPOSITORY_URL
            }
          } as ITask
        ]
      } as IConfig

      const configC = {
        name: 'app',
        framework: {
          name: 'nuxt',
          version: 'latest'
        },
        repository: {
          name: KO_CONFIG_REPOSITORY_NAME,
          url: KO_CONFIG_REPOSITORY_URL
        },
        tasks: 'my-ultimate-setup'
      } as IConfig

      const configs = [
        {
          receive: yaml`
            name: app
            framework: nuxt
          `,
          expect: configA
        }, {
          receive: yaml`
            name: app
            framework:
              nuxt: latest
          `,
          expect: configA
        },
        {
          receive: yaml`
            name: app
            framework:
              nuxt:
                version: latest
          `,
          expect: configA
        },
        {
          receive: yaml`
            name: app
            framework: nuxt
            tasks:
              - name: 'A'
                task: tailwindcss
          `,
          expect: configB
        },
        {
          receive: yaml`
            name: app
            framework: nuxt
            tasks:
              - name: 'A'
                task:
                  tailwindcss: latest
          `,
          expect: configB
        },
        {
          receive: yaml`
            name: app
            framework: nuxt
            tasks:
              - name: 'A'
                task:
                  name: tailwindcss
                  version: latest
          `,
          expect: configB
        },
        {
          receive: yaml`
            name: app
            framework: nuxt
            tasks: my-ultimate-setup
          `,
          expect: configC
        }
      ] as { receive: IUserConfig, expect: IConfig }[]

      configs.forEach(config => expect(normalize(config.receive)).toStrictEqual(config.expect))
    })
  })
})
