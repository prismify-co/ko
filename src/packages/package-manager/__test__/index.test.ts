import { existsSync as exists } from 'fs'
import { join } from 'path'
import { rm, cp } from 'shelljs'
// import { readJSON, writeJSON } from '@ko/utils/fs'
// import { rmmktestdir, chtestdir, rmtestdir, testdir } from '@ko/utils/tests'
import { nanoid } from 'nanoid'
import pkgm from '..'
import { rmmktestdir, chtestdir, testdir, mktestdir } from '../../utils/tests'
import { readJSON, writeJSON } from '../../utils/fs'

const cwd = process.cwd()
const testid = nanoid()
const FIXTURES_PATH = join(__dirname, '__fixtures__')
describe('packages/package-manager', () => {
  beforeAll(() => {
    rmmktestdir(testid)
    chtestdir(testid)
  })

  afterAll(() => {
    process.chdir(cwd)
  })

  describe('init', () => {
    const PATH = [testid, 'init']
    beforeAll(() => {
      rmmktestdir(...PATH)
      chtestdir(...PATH)
    })

    it('should initialize a package.json', async () => {
      await pkgm().init()
      expect(exists(testdir(...PATH, 'package.json'))).toEqual(true)
    })
  })

  describe('which', () => {
    const NPM_PATH = [testid, 'which', 'npm']
    const YARN_PATH = [testid, 'which', 'yarn']

    beforeAll(() => {
      mktestdir(...NPM_PATH)
      mktestdir(...YARN_PATH)
    })

    describe('npm', () => {
      beforeAll(() => chtestdir(...NPM_PATH))
      it('should determine package as npm', () => {
        expect(pkgm().which()).toEqual('npm')
      })
    })

    describe('yarn', () => {
      beforeAll(() => {
        chtestdir(...YARN_PATH)
        cp(
          join(FIXTURES_PATH, 'yarn.lock.txt'),
          testdir(...YARN_PATH, 'yarn.lock')
        )
      })
      it('should determine package as yarn', () => {
        expect(pkgm().which()).toEqual('yarn')
      })
    })
  })

  describe('install', () => {
    const PATH = [testid, 'install']
    const PATH_ASYNC = [...PATH, 'async']
    const PATH_SYNC = [...PATH, 'sync']
    const NODE_MODULES_PATH_ASYNC = [...PATH_ASYNC, 'node_modules']
    const NODE_MODULES_PATH_SYNC = [...PATH_SYNC, 'node_modules']
    beforeAll(() => {
      mktestdir(...PATH)
      mktestdir(...PATH_ASYNC)
      mktestdir(...PATH_SYNC)

      const pkgPath = join(FIXTURES_PATH, 'package.json.txt')
      const pkg = readJSON(pkgPath)

      writeJSON(testdir(...PATH_ASYNC, 'package.json'), {
        ...pkg,
        dependencies: { lodash: '4.17.20' },
      })

      writeJSON(testdir(...PATH_SYNC, 'package.json'), {
        ...pkg,
        dependencies: { lodash: '4.17.20' },
      })
    })

    describe('async', () => {
      beforeAll(() => chtestdir(...PATH_ASYNC))
      afterAll(() => chtestdir(...PATH))
      it('should install node_modules', async () => {
        await pkgm().install()
        expect(exists(testdir(...NODE_MODULES_PATH_ASYNC))).toEqual(true)
      })
    })

    describe('sync', () => {
      beforeAll(() => chtestdir(...PATH_SYNC))
      afterAll(() => chtestdir(...PATH))
      it('should install node_modules', () => {
        pkgm().installSync()
        expect(exists(testdir(...NODE_MODULES_PATH_SYNC))).toEqual(true)
      })
    })
  })

  describe('run', () => {
    const PATH = [testid, 'run']
    const PKG_PATH = [...PATH, 'package.json']
    beforeAll(() => {
      mktestdir(...PATH)
      chtestdir(...PATH)
      cp(join(FIXTURES_PATH, 'package.json.txt'), testdir(...PKG_PATH))
    })
    describe('add', () => {
      // beforeEach(() => process.chdir(OUTPUT_DIR))

      describe('async', () => {
        it('should install a dependency', async () => {
          await pkgm().add(['lodash'])
          const pkg = readJSON(testdir(...PKG_PATH)) as any
          expect(pkg?.dependencies?.lodash).not.toBeUndefined()
        })

        it('should install a dependency with version', async () => {
          await pkgm().add([{ name: 'moment', version: '2.9.0' }])
          const pkg = readJSON(testdir(...PKG_PATH)) as any
          expect(pkg?.dependencies?.moment).toContain('2.9.0')
        })

        it('should install a dev dependency', async () => {
          await pkgm().add([{ name: 'babel', dev: true }])
          const pkg = readJSON(testdir(...PKG_PATH)) as any
          expect(pkg?.devDependencies?.babel).not.toBeUndefined()
        })
      })

      describe('sync', () => {
        it('should install a dependency', () => {
          pkgm().addSync(['react'])
          const pkg = readJSON(testdir(...PKG_PATH)) as any
          expect(pkg?.dependencies?.react).not.toBeUndefined()
        })

        it('should install a dependency with version', () => {
          pkgm().addSync([{ name: 'react-dom', version: '15.4.1' }])
          const pkg = readJSON(testdir(...PKG_PATH)) as any
          expect(pkg?.dependencies).not.toBeUndefined()
          expect(pkg?.dependencies['react-dom']).toContain('15.4.1')
        })

        it('should install a dev dependency', () => {
          pkgm().addSync([{ name: 'vue', dev: true }])
          const pkg = readJSON(testdir(...PKG_PATH)) as any
          expect(pkg?.devDependencies?.vue).not.toBeUndefined()
        })
      })
    })
  })

  describe('remove', () => {
    const PATH = [testid, 'remove']
    const PKG_PATH = testdir(...[...PATH, 'package.json'])
    beforeAll(async () => {
      mktestdir(...PATH)
      chtestdir(...PATH)
      cp(join(FIXTURES_PATH, 'package.json.txt'), PKG_PATH)
      await pkgm().add(['lodash', { name: 'babel', dev: true }])
    })
    describe('async', () => {
      it('should remove a dependency', async () => {
        await pkgm().remove(['lodash'])
        const pkg = readJSON(PKG_PATH) as any
        expect(pkg?.dependencies?.lodash).toBeUndefined()
      })

      it('should remove a dev dependency', async () => {
        await pkgm().remove([{ name: 'babel', dev: true }])
        const pkg = readJSON(PKG_PATH) as any
        expect(pkg?.devDependencies?.babel).toBeUndefined()
      })
    })

    describe('sync', () => {
      it('should install a dependency', () => {
        pkgm().removeSync(['react'])
        const pkg = readJSON(PKG_PATH) as any
        expect(pkg?.dependencies?.react).toBeUndefined()
      })

      it('should install a dependency with version', () => {
        pkgm().removeSync([{ name: 'react-dom' }])
        const pkg = readJSON(PKG_PATH) as any
        expect(pkg?.dependencies).not.toBeUndefined()
        expect(pkg?.dependencies['react-dom']).toBeUndefined()
      })

      it('should install a dev dependency', () => {
        pkgm().removeSync([{ name: 'vue', dev: true }])
        const pkg = readJSON(PKG_PATH) as any
        expect(pkg?.devDependencies?.vue).toBeUndefined()
      })
    })
  })

  describe('has', () => {
    const PATH = [testid, 'remove']
    const PKG_PATH = [...PATH, 'package.json']
    beforeAll(async () => {
      mktestdir(...PATH)
      chtestdir(...PATH)
      cp(join(FIXTURES_PATH, 'package.json.txt'), testdir(...PKG_PATH))
      await pkgm().add(['express'])
    })

    it('should find express in dependencies', () => {
      expect(pkgm().has('express')).toEqual(true)
    })

    it('should not find chalk', () => {
      expect(pkgm().has('chalk')).toEqual(false)
    })

    describe('simulate no package.json', () => {
      beforeAll(() => {
        rm(testdir(...PKG_PATH))
      })
      it('should not find any package without a package.json', () => {
        expect(pkgm().has('react')).toEqual(false)
      })
    })
  })
})
