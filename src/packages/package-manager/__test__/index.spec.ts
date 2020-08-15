import { existsSync, readFile, writeFile, writeFileSync } from 'fs'
import { join } from 'path'
import { cat, mkdir, rm } from 'shelljs'
import { promisify } from 'util'

import pkgm from '..'

const read = promisify(readFile)
const write = promisify(writeFile)

const readPackage = async (path: string) =>
  JSON.parse((await read(join(path, 'package.json'))).toString('utf-8'))

const examplePackage = JSON.stringify({
  name: 'package',
  description: '',
  version: '1.0.0',
  main: 'index.js',
  scripts: {
    test: 'echo "Error: no test specified" && exit 1',
  },
  repository: {
    type: 'git',
    url: 'https://github.com/prismify/prismify.git',
  },
  keywords: [],
  author: '',
  license: 'MIT',
  bugs: {
    url: 'https://github.com/prismify/prismify-ko',
  },
  homepage: 'https://github.com/prismify/prismify-ko',
})

describe('modules/package', () => {
  const dir = join(__dirname, 'output')

  beforeAll(async () => {
    mkdir(dir)
    await write(join(dir, 'package.json'), examplePackage, 'utf-8')
  })

  afterAll(() => {
    rm('-rf', dir)
  })

  describe('install', () => {
    it('should install react', async () => {
      await pkgm().add(['react'], {
        cwd: dir,
      })
      const { dependencies } = await readPackage(dir)
      expect(dependencies.react).not.toBeUndefined()
    })

    it('should install babel as a dev dependency', async () => {
      await pkgm().add(
        [
          {
            name: 'babel',
            version: 'latest',
            dev: true,
          },
        ],
        {
          cwd: dir,
        }
      )
      const { devDependencies } = await readPackage(dir)
      expect(devDependencies.babel).not.toBeUndefined()
    })

    it('should install moment@v2.0.0', async () => {
      await pkgm().add(
        [
          {
            name: 'moment',
            version: '2.0.0',
            dev: false,
          },
        ],
        {
          cwd: dir,
        }
      )
      const { dependencies } = await readPackage(dir)
      expect(dependencies.moment).toBe('2.0.0')
    })
  })

  describe('remove', () => {
    it('should remove react', async () => {
      await pkgm().remove(['react'], {
        cwd: dir,
      })
      expect(cat(join(dir, 'package.json'))).not.toContain('react')
    })

    it('should remove babel as a dev dependency', async () => {
      await pkgm().remove(
        [
          {
            name: 'babel',
            dev: true,
          },
        ],
        {
          cwd: dir,
        }
      )
      expect(cat(join(dir, 'package.json'))).not.toContain('babel')
    })
  })
})
