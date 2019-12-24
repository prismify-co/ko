import { existsSync, writeFileSync } from 'fs'
import { join } from 'path'
import { cat, mkdir, rm } from 'shelljs'

import Package from '../'

describe('modules/package', () => {
  const dir = join(__dirname, 'output')

  beforeAll(() => {
    mkdir(dir)
    writeFileSync(join(dir, 'package.json'), `{
      "name": "test",
      "version": "v0.0.1"
    }`, 'utf8')
  })

  afterAll(() => {
    rm('-rf', dir)
  })

  describe('install', () => {
    it('should install react', () => {
      Package.add(['react'], {
        cwd: dir
      }).then(() => {
        expect(existsSync(join(dir, 'node_modules'))).toBe(true)
        expect(JSON.parse(cat(join(dir, 'package.json'))).dependencies.react).not.toBeUndefined()
      }).catch()
    })

    it('should install babel as a dev dependency', () => {
      Package.add([{
        name: 'babel',
        version: 'latest',
        dev: true
      }], {
        cwd: dir
      }).then(() => {
        expect(existsSync(join(dir, 'node_modules'))).toBe(true)
        expect(JSON.parse(cat(join(dir, 'package.json'))).devDependencies.babel).not.toBeUndefined()
      }).catch()
    })

    it('should install moment@v2.0.0', async () => {
      await Package.add([{
        name: 'moment',
        version: '2.0.0',
        dev: false
      }], {
        cwd: dir
      })
      expect(JSON.parse(cat(join(dir, 'package.json'))).dependencies.moment).toBe('2.0.0')
    })
  })

  describe('remove', () => {
    it('should remove react', () => {
      Package.remove(['react'], {
        cwd: dir
      }).then(() => {
        expect(cat(join(dir, 'package.json'))).not.toContain('react')
      }).catch()
    })

    it('should remove babel as a dev dependency', () => {
      Package.remove([{
        name: 'babel',
        version: 'latest',
        dev: true
      }], {
        cwd: dir
      }).then(() => {
        expect(cat(join(dir, 'package.json'))).not.toContain('babel')
      }).catch()
    })
  })
})