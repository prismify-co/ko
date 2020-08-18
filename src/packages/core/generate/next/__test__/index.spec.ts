import { existsSync as exists, mkdir as createDir, readFileSync } from 'fs'
import latestVersion from 'latest-version'
import { join } from 'path'
import { rm } from 'shelljs'
import { promisify } from 'util'
import next from '..'
import generate from '../..'

const mkdir = promisify(createDir)

const OUTPUT_DIR = join(__dirname, 'output')
const LATEST_DIR = join(OUTPUT_DIR, 'app-latest')
const SPECIFIED_DIR = join(OUTPUT_DIR, 'app-specified')
const JS_DIR = join(OUTPUT_DIR, 'app-js')

jest.setTimeout(300000)

async function createOutputDir() {
  if (!exists(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR)
  }
  process.chdir(OUTPUT_DIR)
}

async function removeOutputDir() {
  process.chdir(join('../'))
  if (exists(OUTPUT_DIR)) {
    rm('-rf', OUTPUT_DIR)
  }
}

describe('create a minimal next application', () => {
  beforeAll(async () => {
    await createOutputDir()
  })

  afterAll(async () => {
    await removeOutputDir()
  })

  afterEach(() => {
    process.chdir(OUTPUT_DIR)
  })

  describe('latest', () => {
    beforeAll(async () => {
      await generate({
        name: 'app-latest',
        framework: 'next',
        typescript: true,
      })
    })

    it('should create a directory for the project', async () => {
      expect(exists(LATEST_DIR)).toEqual(true)
    })

    it('should create a package.json file', async () => {
      expect(exists(join(LATEST_DIR, 'package.json'))).toEqual(true)
    })

    it('should create a tsconfig.json file', async () => {
      expect(exists(join(LATEST_DIR, 'tsconfig.json'))).toEqual(true)
    })

    it('should create a next.config.js file', async () => {
      expect(exists(join(LATEST_DIR, 'next.config.js'))).toEqual(true)
    })

    it('should have the latest version of next', async () => {
      const { dependencies } = JSON.parse(
        readFileSync(join(LATEST_DIR, 'package.json'), 'utf8')
      )

      expect(dependencies.next).toEqual(`^${await latestVersion('next')}`)
    })

    it('should create the directories for next', async () => {
      const pages = ['components', 'pages', 'styles', 'public']
      for (const dir of pages) {
        expect(exists(join(LATEST_DIR, dir))).toEqual(true)
      }
    })

    it('should create an index.tsx', async () => {
      expect(exists(join(LATEST_DIR, 'pages', 'index.tsx'))).toEqual(true)
    })

    it('should create an _app.tsx', async () => {
      expect(exists(join(LATEST_DIR, 'pages', '_app.tsx'))).toEqual(true)
    })

    it('should create an _document.tsx', async () => {
      expect(exists(join(LATEST_DIR, 'pages', '_document.tsx'))).toEqual(true)
    })

    it('should create an home.module.css', async () => {
      expect(exists(join(LATEST_DIR, 'styles', 'home.module.css'))).toEqual(
        true
      )
    })

    it('should create an globals.css', async () => {
      expect(exists(join(LATEST_DIR, 'styles', 'globals.css'))).toEqual(true)
    })

    it('should create a gitignore file', async () => {
      expect(exists(join(LATEST_DIR, '.gitignore'))).toEqual(true)
    })
  })

  describe('v9.3.0', () => {
    beforeAll(async () => {
      await generate({
        name: 'app-specified',
        framework: 'next',
        version: '9.3.0',
        typescript: true,
      })
    })

    it('should create a directory for the project', async () => {
      expect(exists(SPECIFIED_DIR)).toEqual(true)
    })

    it('should create a package.json file', async () => {
      expect(exists(join(SPECIFIED_DIR, 'package.json'))).toEqual(true)
    })

    it('should have the latest version of next', async () => {
      const { dependencies } = JSON.parse(
        readFileSync(join(SPECIFIED_DIR, 'package.json'), 'utf8')
      )
      expect(dependencies.next).toEqual(`^9.3.0`)
    })
  })

  describe('javascript', () => {
    beforeAll(async () => {
      await generate({ name: 'app-js', framework: 'next', typescript: false })
    })

    it('should create a directory for the project', async () => {
      expect(exists(JS_DIR)).toEqual(true)
    })

    it('should create a package.json file', async () => {
      expect(exists(join(JS_DIR, 'package.json'))).toEqual(true)
    })

    it('should create a tsconfig.json file', async () => {
      expect(exists(join(JS_DIR, 'tsconfig.json'))).toEqual(false)
    })

    it('should create a next.config.js file', async () => {
      expect(exists(join(JS_DIR, 'next.config.js'))).toEqual(true)
    })

    it('should have the latest version of next', async () => {
      const { dependencies } = JSON.parse(
        readFileSync(join(JS_DIR, 'package.json'), 'utf8')
      )

      expect(dependencies.next).toEqual(`^${await latestVersion('next')}`)
    })

    it('should create the directories for next', async () => {
      const pages = ['components', 'pages', 'styles', 'public']
      for (const dir of pages) {
        expect(exists(join(JS_DIR, dir))).toEqual(true)
      }
    })

    it('should create an index.js', async () => {
      expect(exists(join(JS_DIR, 'pages', 'index.js'))).toEqual(true)
    })

    it('should create an _app.js', async () => {
      expect(exists(join(JS_DIR, 'pages', '_app.js'))).toEqual(true)
    })

    it('should create an _document.js', async () => {
      expect(exists(join(JS_DIR, 'pages', '_document.js'))).toEqual(true)
    })

    it('should create an home.module.css', async () => {
      expect(exists(join(JS_DIR, 'styles', 'home.module.css'))).toEqual(true)
    })

    it('should create an globals.css', async () => {
      expect(exists(join(JS_DIR, 'styles', 'globals.css'))).toEqual(true)
    })

    it('should create a gitignore file', async () => {
      expect(exists(join(JS_DIR, '.gitignore'))).toEqual(true)
    })
  })
})
