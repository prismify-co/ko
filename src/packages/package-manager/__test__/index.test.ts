import { existsSync as exists } from 'fs'
import { join } from 'path'
import { cat, mkdir, rm } from 'shelljs'
import pkgm from '..'
import { write, readJSON, JSONLike } from '@ko/utils/fs'

const OUTPUT = join(__dirname, 'output')
const NODE_MODULES = join(OUTPUT, 'node_modules')
const PKG_PATH = join(OUTPUT, 'package.json')

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

describe('packages/package-manager', () => {
  beforeAll(() => {
    mkdir(OUTPUT)
    write(join(OUTPUT, 'package.json'), examplePackage, 'utf-8')
  })

  afterAll(() => {
    rm('-rf', OUTPUT)
  })

  describe('install', () => {
    it('should install react', async () => {
      await pkgm().add(['react'], {
        cwd: OUTPUT,
      })
      const { dependencies } = readJSON(PKG_PATH)
      expect(((dependencies as unknown) as JSONLike).react).not.toBeUndefined()
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
          cwd: OUTPUT,
        }
      )
      const { devDependencies } = readJSON(PKG_PATH)
      expect(
        ((devDependencies as unknown) as JSONLike).babel
      ).not.toBeUndefined()
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
          cwd: OUTPUT,
        }
      )
      const { dependencies } = readJSON(PKG_PATH)
      expect(((dependencies as unknown) as JSONLike).moment).toContain('2.0.0')
    })
  })

  it('should install dependencies and devDependencies', async () => {
    rm('-rf', NODE_MODULES)
    await pkgm().install({ cwd: OUTPUT })
    expect(exists(NODE_MODULES)).toEqual(true)
  })

  describe('remove', () => {
    it('should remove react', async () => {
      await pkgm().remove(['react'], {
        cwd: OUTPUT,
      })
      expect(cat(join(OUTPUT, 'package.json'))).not.toContain('react')
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
          cwd: OUTPUT,
        }
      )
      expect(cat(join(OUTPUT, 'package.json'))).not.toContain('babel')
    })
  })
})
