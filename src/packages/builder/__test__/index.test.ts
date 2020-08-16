import {
  existsSync as exists,
  mkdir as createDir,
  readFileSync as read,
} from 'fs'
import { join } from 'path'
import { promisify } from 'util'
import { rm } from 'shelljs'
import create from '@ko/core/create/next'
import { entry, execute } from '@ko/core/install'
import { setupTsnode } from '@ko/utils/setup-ts-node'

const mkdir = promisify(createDir)

const CWD = __dirname

const OUTPUT_DIR = join(CWD, 'output')
const APP_DIR = join(OUTPUT_DIR, 'app')
const RECIPE_DIR = join(CWD, '__fixtures__')

jest.setTimeout(10 * 100000)

async function createOutputDir() {
  if (!exists(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR)
  } else {
    rm('-rf', OUTPUT_DIR)
    await mkdir(OUTPUT_DIR)
  }
  process.chdir(OUTPUT_DIR)
}

async function removeOutputDir() {
  process.chdir(CWD)
}

describe('packages/installer', () => {
  beforeAll(async () => {
    setupTsnode()
    await createOutputDir()
    await create('app', 'next', '', true)
    process.chdir(APP_DIR)
  })

  afterAll(async () => {
    await removeOutputDir()
  })

  describe('entry', () => {
    it('should return the path of the entry point', async () => {
      expect(await entry(RECIPE_DIR)).toEqual(join(RECIPE_DIR, 'recipe.ts'))
    })
  })

  describe('execute', () => {
    it('should modify a Next.js App', async () => {
      const expected = read(join(RECIPE_DIR, '_app_expected.txt'))
        .toString('utf-8')
        .replace(/\s/g, '')

      const entryPath = await entry(RECIPE_DIR)
      const { executor } = await execute(APP_DIR, RECIPE_DIR, entryPath, false)
      const actual = read(join(APP_DIR, 'pages', '_app.tsx'))
        .toString('utf-8')
        .replace(/\s/g, '')
      expect(executor.commits.length).toBeGreaterThan(0)
      expect(actual).toEqual(expected)
    })
  })
})
