import { namedTypes } from 'ast-types/gen/namedTypes'
import { parse, print, types } from 'recast'
import * as babel from 'recast/parsers/babel'
import getBabelOptions, { Overrides } from 'recast/parsers/_babel_options'
import { Transformer } from './types'
import { exists, write, read } from '@ko/utils/fs'

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

export function processFile(
  original: string,
  transformerFn: Transformer
): string {
  const ast = parse(original, { parser: customTsParser })
  const transformedCode = print(transformerFn(ast, types.builders, namedTypes))
    .code
  return transformedCode
}

export async function transform(
  transformerFn: Transformer,
  targetFilePaths: string[]
): Promise<TransformResult[]> {
  const results: TransformResult[] = []
  for (const filePath of targetFilePaths) {
    if (!exists(filePath)) {
      results.push({
        status: TransformStatus.Failure,
        filename: filePath,
        error: new Error(`Error: ${filePath} not found`),
      })
    }
    try {
      const transformedCode = await processFile(read(filePath), transformerFn)
      write(filePath, transformedCode)
      results.push({
        status: TransformStatus.Success,
        filename: filePath,
      })
    } catch (err) {
      results.push({
        status: TransformStatus.Failure,
        filename: filePath,
        error: err,
      })
    }
  }
  return results
}
