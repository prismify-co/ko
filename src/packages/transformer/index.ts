import { namedTypes } from 'ast-types/gen/namedTypes'
import { parse, print, types } from 'recast'
import * as babel from 'recast/parsers/babel'
import getBabelOptions, { Overrides } from 'recast/parsers/_babel_options'
import { Transformer } from './types'

export const customTsParser = {
  parse(source: string, options?: Overrides) {
    const babelOptions = getBabelOptions(options)
    babelOptions.plugins.push('typescript')
    babelOptions.plugins.push('jsx')
    return babel.parser.parse(source, babelOptions)
  },
}

export enum TransformStatus {
  Success = 'success',
  Failure = 'failure',
}
export interface TransformResult {
  status: TransformStatus
  filename: string
  error?: Error
}

export default function transform(
  original: string,
  transformerFn: Transformer,
  parser = customTsParser
): string {
  const ast = parse(original, { parser })
  return print(transformerFn(ast, types.builders, namedTypes)).code
}
