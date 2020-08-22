import { mkpdir } from '../mkpdir'

describe('packages/utils/mkpdir.ts', () => {
  it('should return undefined when the directory is "."', () => {
    expect(mkpdir('.')).toBeUndefined()
  })
})
