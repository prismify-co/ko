import * as babel from 'recast/parsers/babel'
import getBabelOptions, { Overrides } from 'recast/parsers/_babel_options'
import { Transformer } from './types'
import j from 'jscodeshift'

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
  const program = j(original, {parser })
  return transformerFn(program).toSource()
}
