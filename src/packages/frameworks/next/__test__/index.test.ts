import latestVersion from 'latest-version'
import { join } from 'path'

import factory from '..'
import { nanoid } from 'nanoid'
import {
  chtestdir,
  rmmktestdir,
  rmtestdir,
  testdir,
} from '../../../utils/tests'
import { existsSync, readSync } from '../../../utils/fs'
// import { rmmktestdir, chtestdir, rmtestdir, testdir } from '@ko/utils/tests'
// import { read, existsSync } from '@ko/utils/fs'

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
          framework: 'next',
          typescript: true,
          path: '',
          git: true,
          offline: true,
        }).generate()
      })
      afterAll(() => {
        chtestdir(testid)
      })

      it('should create a directory for the project', () => {
        expect(existsSync(LATEST_PATH)).toEqual(true)
      })

      it('should create a package.json file', () => {
        expect(existsSync(join(LATEST_PATH, 'package.json'))).toEqual(true)
      })

      it('should create a tsconfig.json file', () => {
        expect(existsSync(join(LATEST_PATH, 'tsconfig.json'))).toEqual(true)
      })

      it('should create a next.config.js file', () => {
        expect(existsSync(join(LATEST_PATH, 'next.config.js'))).toEqual(true)
      })

      it('should have the latest version of next', async () => {
        const { dependencies } = JSON.parse(
          readSync(join(LATEST_PATH, 'package.json'))
        )

        expect(dependencies.next).toEqual(`^${await latestVersion('next')}`)
      })

      it('should create the directories for next', () => {
        const pages = ['components', 'pages', 'styles', 'public']
        for (const dir of pages) {
          expect(existsSync(join(LATEST_PATH, dir))).toEqual(true)
        }
      })

      it('should create an index.tsx', () => {
        expect(existsSync(join(LATEST_PATH, 'pages', 'index.tsx'))).toEqual(true)
      })

      it('should create an _app.tsx', () => {
        expect(existsSync(join(LATEST_PATH, 'pages', '_app.tsx'))).toEqual(true)
      })

      it('should create an _document.tsx', () => {
        expect(existsSync(join(LATEST_PATH, 'pages', '_document.tsx'))).toEqual(
          true
        )
      })

      it('should create an home.module.css', () => {
        expect(existsSync(join(LATEST_PATH, 'styles', 'home.module.css'))).toEqual(
          true
        )
      })

      it('should create an globals.css', () => {
        expect(existsSync(join(LATEST_PATH, 'styles', 'globals.css'))).toEqual(true)
      })

      it('should create a gitignore file', () => {
        expect(existsSync(join(LATEST_PATH, '.gitignore'))).toEqual(true)
      })
    })

    describe('v9.3.0', () => {
      beforeAll(async () => {
        await factory({
          name: APP_VERSION,
          framework: 'next',
          path: '',
          version: '9.3.0',
          typescript: true,
          git: true,
          offline: true,
        }).generate()
      })

      afterAll(() => {
        chtestdir(testid)
      })

      it('should create a directory for the project', () => {
        expect(existsSync(VERSION_PATH)).toEqual(true)
      })

      it('should create a package.json file', () => {
        expect(existsSync(join(VERSION_PATH, 'package.json'))).toEqual(true)
      })

      it('should have the latest version of next', () => {
        const { dependencies } = JSON.parse(
          readSync(join(VERSION_PATH, 'package.json'))
        )
        expect(dependencies.next).toEqual(`^9.3.0`)
      })
    })

    describe('javascript', () => {
      beforeAll(async () => {
        await factory({
          name: APP_JAVASCRIPT,
          framework: 'next',
          path: '',
          typescript: false,
          git: true,
          offline: true,
        }).generate()
      })

      afterAll(() => {
        chtestdir(testid)
      })

      it('should create a directory for the project', () => {
        expect(existsSync(JAVASCRIPT_PATH)).toEqual(true)
      })

      it('should create a package.json file', () => {
        expect(existsSync(join(JAVASCRIPT_PATH, 'package.json'))).toEqual(true)
      })

      it('should create a tsconfig.json file', () => {
        expect(existsSync(join(JAVASCRIPT_PATH, 'tsconfig.json'))).toEqual(false)
      })

      it('should create a next.config.js file', () => {
        expect(existsSync(join(JAVASCRIPT_PATH, 'next.config.js'))).toEqual(true)
      })

      it('should have the latest version of next', async () => {
        const { dependencies } = JSON.parse(
          readSync(join(JAVASCRIPT_PATH, 'package.json'))
        )

        expect(dependencies.next).toEqual(`^${await latestVersion('next')}`)
      })

      it('should create the directories for next', () => {
        const pages = ['components', 'pages', 'styles', 'public']
        for (const dir of pages) {
          expect(existsSync(join(JAVASCRIPT_PATH, dir))).toEqual(true)
        }
      })

      it('should create an index.js', () => {
        expect(existsSync(join(JAVASCRIPT_PATH, 'pages', 'index.js'))).toEqual(true)
      })

      it('should create an _app.js', () => {
        expect(existsSync(join(JAVASCRIPT_PATH, 'pages', '_app.js'))).toEqual(true)
      })

      it('should create an _document.js', () => {
        expect(existsSync(join(JAVASCRIPT_PATH, 'pages', '_document.js'))).toEqual(
          true
        )
      })

      it('should create an home.module.css', () => {
        expect(
          existsSync(join(JAVASCRIPT_PATH, 'styles', 'home.module.css'))
        ).toEqual(true)
      })

      it('should create an globals.css', () => {
        expect(existsSync(join(JAVASCRIPT_PATH, 'styles', 'globals.css'))).toEqual(
          true
        )
      })

      it('should create a gitignore file', () => {
        expect(existsSync(join(JAVASCRIPT_PATH, '.gitignore'))).toEqual(true)
      })
    })
  })
})
