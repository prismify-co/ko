import {isDevPackage} from "../is-dev-package";

describe('is-package.test.ts', () => {
  it('should return false when a package is a string', () => {
    expect(isDevPackage('react')).toEqual(false)
  })

  it('should return false when a package is an object and dev is undefined', () => {
    expect(isDevPackage({ name: 'react' })).toEqual(false)
  })

  it('should return false when a package is an object and dev is false', () => {
    expect(isDevPackage({ name: 'react', dev: false })).toEqual(false)
  })

  it('should return true when a package is an object and dev is true', () => {
    expect(isDevPackage({ name: 'react', dev: true })).toEqual(true)
  })
})
