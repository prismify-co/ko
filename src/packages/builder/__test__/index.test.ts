import { join } from 'path'
import { rm, mkdir } from 'shelljs'
import { entry } from '@ko/installer'
import { setupTsnode } from '@ko/utils/setup-ts-node'
import generate from '@ko/core/generate'
import { exists } from '@ko/utils/fs'

const CWD = __dirname
const APP_NAME = 'app-recipe'
const OUTPUT_DIR = join(CWD, 'output')
const APP_DIR = join(OUTPUT_DIR, APP_NAME)
const RECIPE_DIR = join(CWD, '__fixtures__')

jest.setTimeout(10 * 100000)

function createOutputDir() {
  if (!exists(OUTPUT_DIR)) {
    mkdir(OUTPUT_DIR)
  } else {
    rm('-rf', OUTPUT_DIR)
    mkdir(OUTPUT_DIR)
  }
  process.chdir(OUTPUT_DIR)
}

describe('packages/installer', () => {
  beforeAll(async () => {
    setupTsnode()
    createOutputDir()
    await generate({
      framework: 'next',
      name: APP_NAME,
      typescript: true,
    })
    process.chdir(APP_DIR)
  })

  afterAll(() => {
    process.chdir(CWD)
  })

  describe('entry', () => {
    it('should return the path of the entry point', async () => {
      expect(await entry(RECIPE_DIR)).toEqual(join(RECIPE_DIR, 'recipe.ts'))
    })
  })

  describe('execute', () => {
    it('should modify a Next.js App', async () => {
      const expected = read(join(RECIPE_DIR, '_app_expected.txt')).replace(
        /\s/g,
        ''
      )

      const entryPath = await entry(RECIPE_DIR)
      const { executor } = await execute(APP_DIR, RECIPE_DIR, entryPath, false)
      const actual = read(join(APP_DIR, 'pages', '_app.tsx')).replace(/\s/g, '')
      expect(exists(join(APP_DIR, 'pages', '_app.tsx'))).toEqual(true)
      expect(executor.commits.length).toBeGreaterThan(0)
      expect(actual).toEqual(expected)
    })
  })
})
