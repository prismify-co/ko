import { existsSync, mkdirSync, readFileSync } from 'fs'
import latestVersion from 'latest-version'
import { join } from 'path'
import { rm } from 'shelljs'

import create from '../main'

function createOutputDir() {
  if (!existsSync(join(__dirname, 'output'))) {
    mkdirSync(join(__dirname, 'output'))
  }
  process.chdir(join(__dirname, 'output'))
}

function removeOutputDir() {
  process.chdir(join('../'))
  if (existsSync(join(__dirname, 'output'))) {
    rm('-rf', join(__dirname, 'output'))
  }
}

describe('create a minimal nuxt application', () => {
  describe('create(app-latest, nuxt, latest)', () => {
    beforeAll(async () => {
      createOutputDir()
      await create('app-latest', 'nuxt', 'latest')
    })

    afterAll(() => {
      removeOutputDir()
    })

    it('should create a directory for the project', () => {
      expect(existsSync(join(__dirname, 'output', 'app-latest'))).toBe(true)
    })

    it('should create a package.json file', () => {
      const path = join(__dirname, 'output', 'app-latest')
      expect(existsSync(join(path, 'package.json')))
    })

    it('should have version 2.0.0 of nuxt', async () => {
      const path = join(__dirname, 'output', 'app-latest')
      const { dependencies } = JSON.parse(readFileSync(join(path, 'package.json'), 'utf8'))

      expect(dependencies.nuxt).toEqual(`^${await latestVersion('nuxt')}`)
    })

    it('should create the directories for nuxt', () => {
      ['assets', 'components', 'layouts', 'middleware', 'pages', 'plugins', 'static', 'store']
        .forEach(dir => {
          expect(existsSync(join(__dirname, 'output', 'app-latest', dir))).toBe(true)
        })
    })

    it('should create an index.vue', () => {
      expect(existsSync(join(__dirname, 'output', 'app-latest', 'pages', 'index.vue'))).toBe(true)
    })

    it('should create a gitignore file', () => {
      expect(existsSync(join(__dirname, 'output', 'app-latest', '.gitignore'))).toBe(true)
    })
  })

  describe('create(app-v2, nuxt, v2.0.0)', () => {
    beforeAll(async () => {
      await create('app-v2', 'nuxt', 'v2.0.0')
    })

    afterAll(() => {
      removeOutputDir()
    })

    it('should create a directory for the project', () => {
      expect(existsSync(join(__dirname, 'output', 'app-v2'))).toBe(true)
    })

    it('should create a package.json file', () => {
      const path = join(__dirname, 'output', 'app-v2')
      expect(existsSync(join(path, 'package.json')))
    })

    it('should have the latest version of nuxt', async () => {
      const path = join(__dirname, 'output', 'app-v2')
      const { dependencies } = JSON.parse(readFileSync(join(path, 'package.json'), 'utf8'))

      expect(dependencies.nuxt).toEqual('^2.0.0')
    })

    it('should create the directories for nuxt', () => {
      ['assets', 'components', 'layouts', 'middleware', 'pages', 'plugins', 'static', 'store']
        .forEach(dir => {
          expect(existsSync(join(__dirname, 'output', 'app-v2', dir))).toBe(true)
        })
    })

    it('should create an index.vue', () => {
      expect(existsSync(join(__dirname, 'output', 'app-v2', 'pages', 'index.vue'))).toBe(true)
    })

    it('should create a gitignore file', () => {
      expect(existsSync(join(__dirname, 'output', 'app-v2', '.gitignore'))).toBe(true)
    })
  })
})
