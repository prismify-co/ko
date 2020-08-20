// import hbs from 'handlebars'
import { JSONLike } from './fs'
import { Transform } from 'stream'
import File from 'vinyl'
import hbs from 'handlebars'
import { Transformer } from '@ko/transformer/types'
import transform from '@ko/transformer'

export const handlebars = (context?: JSONLike) =>
  new Transform({
    objectMode: true,
    transform(chunk: File, encoding, callback) {
      if (context) {
        const template = hbs.compile(chunk.contents?.toString())
        this.push(
          new File({
            base: chunk.base,
            path: chunk.path,
            cwd: chunk.cwd,
            history: chunk.history as any,
            stat: chunk.stat as any,
            contents: Buffer.from(template(context)),
          })
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
    transform(chunk: File, encoding, callback) {
      this.push(
        new File({
          base: chunk.base,
          path: chunk.path,
          cwd: chunk.cwd,
          history: chunk.history as any,
          stat: chunk.stat as any,
          contents: Buffer.from(
            transform(chunk.contents?.toString('utf-8') || '', transformer)
          ),
        })
      )
      return callback()
    },
  })
