import latestVersion from 'latest-version'
import { join } from 'path'

import factory from '../'
import { nanoid } from 'nanoid'
import { rmmktestdir, chtestdir, rmtestdir, testdir } from '@ko/utils/tests'
import { read, exists } from '@ko/utils/fs'

const cwd = process.cwd()
const testid = nanoid()

const APP_LATEST = 'app-latest'
const APP_VERSION = 'app-version'
const APP_JAVASCRIPT = 'app-javascript'

const LATEST_PATH = testdir(testid, APP_LATEST)
const VERSION_PATH = testdir(testid, APP_VERSION)
const JAVASCRIPT_PATH = testdir(testid, APP_JAVASCRIPT)

jest.setTimeout(300000)

describe('packages/frameworks/next', () => {
  describe('create a minimal next application', () => {
    beforeAll(() => {
      rmtestdir()
      rmmktestdir(testid)
      chtestdir(testid)
    })
    afterAll(() => {
      process.chdir(cwd)
      rmtestdir(testid)
    })

    describe('latest', () => {
      beforeAll(async () => {
        await factory({
          name: APP_LATEST,
          typescript: true,
          git: true,
        }).generate()
      })
      afterAll(() => {
        chtestdir(testid)
      })

      it('should create a directory for the project', () => {
        expect(exists(LATEST_PATH)).toEqual(true)
      })

      it('should create a package.json file', () => {
        expect(exists(join(LATEST_PATH, 'package.json'))).toEqual(true)
      })

      it('should create a tsconfig.json file', () => {
        expect(exists(join(LATEST_PATH, 'tsconfig.json'))).toEqual(true)
      })

      it('should create a next.config.js file', () => {
        expect(exists(join(LATEST_PATH, 'next.config.js'))).toEqual(true)
      })

      it('should have the latest version of next', async () => {
        const { dependencies } = JSON.parse(
          read(join(LATEST_PATH, 'package.json'))
        )

        expect(dependencies.next).toEqual(`^${await latestVersion('next')}`)
      })

      it('should create the directories for next', () => {
        const pages = ['components', 'pages', 'styles', 'public']
        for (const dir of pages) {
          expect(exists(join(LATEST_PATH, dir))).toEqual(true)
        }
      })

      it('should create an index.tsx', () => {
        expect(exists(join(LATEST_PATH, 'pages', 'index.tsx'))).toEqual(true)
      })

      it('should create an _app.tsx', () => {
        expect(exists(join(LATEST_PATH, 'pages', '_app.tsx'))).toEqual(true)
      })

      it('should create an _document.tsx', () => {
        expect(exists(join(LATEST_PATH, 'pages', '_document.tsx'))).toEqual(
          true
        )
      })

      it('should create an home.module.css', () => {
        expect(exists(join(LATEST_PATH, 'styles', 'home.module.css'))).toEqual(
          true
        )
      })

      it('should create an globals.css', () => {
        expect(exists(join(LATEST_PATH, 'styles', 'globals.css'))).toEqual(true)
      })

      it('should create a gitignore file', () => {
        expect(exists(join(LATEST_PATH, '.gitignore'))).toEqual(true)
      })
    })

    describe('v9.3.0', () => {
      beforeAll(async () => {
        await factory({
          name: APP_VERSION,
          version: '9.3.0',
          typescript: true,
          git: true,
        }).generate()
      })

      afterAll(() => {
        chtestdir(testid)
      })

      it('should create a directory for the project', () => {
        expect(exists(VERSION_PATH)).toEqual(true)
      })

      it('should create a package.json file', () => {
        expect(exists(join(VERSION_PATH, 'package.json'))).toEqual(true)
      })

      it('should have the latest version of next', () => {
        const { dependencies } = JSON.parse(
          read(join(VERSION_PATH, 'package.json'))
        )
        expect(dependencies.next).toEqual(`^9.3.0`)
      })
    })

    describe('javascript', () => {
      beforeAll(async () => {
        await factory({
          name: APP_JAVASCRIPT,
          typescript: false,
          git: true,
        }).generate()
      })

      afterAll(() => {
        chtestdir(testid)
      })

      it('should create a directory for the project', () => {
        expect(exists(JAVASCRIPT_PATH)).toEqual(true)
      })

      it('should create a package.json file', () => {
        expect(exists(join(JAVASCRIPT_PATH, 'package.json'))).toEqual(true)
      })

      it('should create a tsconfig.json file', () => {
        expect(exists(join(JAVASCRIPT_PATH, 'tsconfig.json'))).toEqual(false)
      })

      it('should create a next.config.js file', () => {
        expect(exists(join(JAVASCRIPT_PATH, 'next.config.js'))).toEqual(true)
      })

      it('should have the latest version of next', async () => {
        const { dependencies } = JSON.parse(
          read(join(JAVASCRIPT_PATH, 'package.json'))
        )

        expect(dependencies.next).toEqual(`^${await latestVersion('next')}`)
      })

      it('should create the directories for next', () => {
        const pages = ['components', 'pages', 'styles', 'public']
        for (const dir of pages) {
          expect(exists(join(JAVASCRIPT_PATH, dir))).toEqual(true)
        }
      })

      it('should create an index.js', () => {
        expect(exists(join(JAVASCRIPT_PATH, 'pages', 'index.js'))).toEqual(true)
      })

      it('should create an _app.js', () => {
        expect(exists(join(JAVASCRIPT_PATH, 'pages', '_app.js'))).toEqual(true)
      })

      it('should create an _document.js', () => {
        expect(exists(join(JAVASCRIPT_PATH, 'pages', '_document.js'))).toEqual(
          true
        )
      })

      it('should create an home.module.css', () => {
        expect(
          exists(join(JAVASCRIPT_PATH, 'styles', 'home.module.css'))
        ).toEqual(true)
      })

      it('should create an globals.css', () => {
        expect(exists(join(JAVASCRIPT_PATH, 'styles', 'globals.css'))).toEqual(
          true
        )
      })

      it('should create a gitignore file', () => {
        expect(exists(join(JAVASCRIPT_PATH, '.gitignore'))).toEqual(true)
      })
    })
  })
})
