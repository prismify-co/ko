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

describe('create a minimal next application', () => {
  describe('create(app-latest, next, latest)', () => {
    beforeAll(async () => {
      createOutputDir()
      await create('app-latest', 'next', 'latest')
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

    it('should have the latest version of next', async () => {
      const path = join(__dirname, 'output', 'app-latest')
      const { dependencies } = JSON.parse(readFileSync(join(path, 'package.json'), 'utf8'))

      expect(dependencies.next).toEqual(`^${await latestVersion('next')}`)
    })

    it('should create the directories for next', () => {
      ['assets', 'components', 'pages', 'public']
        .forEach(dir => {
          expect(existsSync(join(__dirname, 'output', 'app-latest', dir))).toBe(true)
        })
    })

    it('should create an index.jsx', () => {
      expect(existsSync(join(__dirname, 'output', 'app-latest', 'pages', 'index.jsx'))).toBe(true)
    })

    it('should create a gitignore file', () => {
      expect(existsSync(join(__dirname, 'output', 'app-latest', '.gitignore'))).toBe(true)
    })
  })

  describe('create(app, next, v9.0.0)', () => {
    beforeAll(async () => {
      await create('app', 'next', 'v9.0.0')
    })

    afterAll(() => {
      removeOutputDir()
    })

    it('should create a directory for the project', () => {
      expect(existsSync(join(__dirname, 'output', 'app'))).toBe(true)
    })

    it('should create a package.json file', () => {
      const path = join(__dirname, 'output', 'app')
      expect(existsSync(join(path, 'package.json')))
    })

    it('should have v9.0.0 of next', async () => {
      const path = join(__dirname, 'output', 'app')
      const { dependencies } = JSON.parse(readFileSync(join(path, 'package.json'), 'utf8'))

      expect(dependencies.next).toEqual('9.0.0')
    })

    it('should create the directories for next', () => {
      ['assets', 'components', 'pages', 'public']
        .forEach(dir => {
          expect(existsSync(join(__dirname, 'output', 'app', dir))).toBe(true)
        })
    })

    it('should create an index.jsx', () => {
      expect(existsSync(join(__dirname, 'output', 'app', 'pages', 'index.jsx'))).toBe(true)
    })

    it('should create a gitignore file', () => {
      expect(existsSync(join(__dirname, 'output', 'app', '.gitignore'))).toBe(true)
    })
  })
})
