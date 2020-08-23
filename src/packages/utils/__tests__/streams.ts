import { ReadStream } from 'fs'
// @ts-ignore
import StreamTest from 'streamtest'
import { handlebars, transformer, lodash } from '../streams'

describe('packages/utils/streams', () => {
  describe('handlebars', () => {
    it('should stream and interpolate the input', async () => {
      const actual = await new Promise<string>((resolve, reject) => {
        ;(StreamTest.v2.fromChunks(['{{greeting}}']) as ReadStream)
          .pipe(handlebars({ greeting: 'hello' }))
          .pipe(
            StreamTest.v2.toText(function (error: Error, text: string) {
              if (error) reject(error)
              else resolve(text)
            })
          )
      })
      expect(actual).toEqual('hello')
    })

    it('should stream and return the input', async () => {
      const actual = await new Promise<string>((resolve, reject) => {
        ;(StreamTest.v2.fromChunks(['hello']) as ReadStream)
          .pipe(handlebars())
          .pipe(
            StreamTest.v2.toText(function (error: Error, text: string) {
              if (error) reject(error)
              else resolve(text)
            })
          )
      })
      expect(actual).toEqual('hello')
    })
  })

  describe('lodash', () => {
    it('should stream and interpolate the input', async () => {
      const actual = await new Promise<string>((resolve, reject) => {
        ;(StreamTest.v2.fromChunks(['<%- greeting %>']) as ReadStream)
          .pipe(lodash({ greeting: 'hello' }))
          .pipe(
            StreamTest.v2.toText(function (error: Error, text: string) {
              if (error) reject(error)
              else resolve(text)
            })
          )
      })
      expect(actual).toEqual('hello')
    })

    it('should stream and return the input', async () => {
      const actual = await new Promise<string>((resolve, reject) => {
        ;(StreamTest.v2.fromChunks(['hello']) as ReadStream)
          .pipe(lodash())
          .pipe(
            StreamTest.v2.toText(function (error: Error, text: string) {
              if (error) reject(error)
              else resolve(text)
            })
          )
      })
      expect(actual).toEqual('hello')
    })
  })

  describe('transformer', () => {
    it('should stream and return an identity', async () => {
      const actual = await new Promise<string>((resolve, reject) => {
        ;(StreamTest.v2.fromChunks(['hello']) as ReadStream)
          .pipe(
            transformer(function (ast) {
              return ast
            })
          )
          .pipe(
            StreamTest.v2.toText(function (error: Error, text: string) {
              if (error) reject(error)
              else resolve(text)
            })
          )
      })

      expect(actual).toEqual('hello')
    })
  })
})
