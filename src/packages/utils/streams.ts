import { JSONLike } from './fs'
import { Transform } from 'stream'
import File from 'vinyl'
import hbs from 'handlebars'
import transform from '../transformer'
import { Transformer } from '../transformer/types'
import template from 'lodash/template'
// import { Transformer } from '@ko/transformer/types'
// import transform from '@ko/transformer'

export const handlebars = (context?: JSONLike) =>
  new Transform({
    objectMode: true,
    transform(chunk: string | Buffer | File, encoding, callback) {
      if (context) {
        const template = hbs.compile(
          chunk instanceof File
            ? chunk.contents?.toString()
            : chunk.toString('utf-8')
        )
        this.push(
          chunk instanceof File
            ? new File({
                base: chunk.base,
                path: chunk.path,
                cwd: chunk.cwd,
                history: chunk.history as any,
                stat: chunk.stat as any,
                contents: Buffer.from(template(context)),
              })
            : template(context)
        )
        return callback()
      }

      this.push(chunk)

      return callback()
    },
  })

export const lodash = (context?: JSONLike) =>
  new Transform({
    objectMode: true,
    transform(chunk: string | Buffer | File, encoding, callback) {
      if (context) {
        const compiled = template(
          chunk instanceof File
            ? chunk.contents?.toString()
            : chunk.toString('utf-8')
        )
        this.push(
          chunk instanceof File
            ? new File({
                base: chunk.base,
                path: chunk.path,
                cwd: chunk.cwd,
                history: chunk.history as any,
                stat: chunk.stat as any,
                contents: Buffer.from(compiled(context)),
              })
            : compiled(context)
        )
        return callback()
      }

      this.push(chunk)

      return callback()
    },
  })

export const transformer = (transformer: Transformer) =>
  new Transform({
    objectMode: true,
    transform(chunk: string | Buffer | File, encoding, callback) {
      this.push(
        chunk instanceof File
          ? new File({
              base: chunk.base,
              path: chunk.path,
              cwd: chunk.cwd,
              history: chunk.history as any,
              stat: chunk.stat as any,
              contents: Buffer.from(
                transform(chunk.contents?.toString('utf-8') || '', transformer)
              ),
            })
          : transform(chunk.toString('utf-8') || '', transformer)
      )
      return callback()
    },
  })
