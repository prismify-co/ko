import {join} from "path";
import {packageExists, packageExistsSync} from "../package-exists";

const cwd = process.cwd()
const FIXTURES_PATH = join(__dirname, '__fixtures__')

jest.setTimeout(300000)

describe('package-exists', () => {
  beforeAll(() => {
    process.chdir(FIXTURES_PATH)
  })

  afterAll(() => {
    process.chdir(cwd)
  })

  it('should find "react" in package.json synchronously', () => {
    expect(packageExistsSync('react')).toEqual(true)
  })

  it('should not find "react-dom" in package.json synchronously', () => {
    expect(packageExistsSync('react-dom')).toEqual(false)
  })

  it('should find "react" in package.json asynchronously', () => {
    return packageExists('react').then(result => expect(result).toEqual(true))
  })

  it('should not find "react-dom" in package.json asynchronously', () => {
    return packageExists('react-dom').then(result => expect(result).toEqual(false))
  })
})
