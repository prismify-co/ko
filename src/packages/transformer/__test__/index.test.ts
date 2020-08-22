// import { parse, print, types } from 'recast'
// import { namedTypes, NamedTypes } from 'ast-types/gen/namedTypes'
// import { customTsParser } from '..'
// import { ASTNode } from 'ast-types'
// import { builders } from 'ast-types/gen/builders'

import transform from '..'
import j from 'jscodeshift'

describe('packages/transformer', () => {
  it('it should return an identity (ast -> ast)', () => {
    const file = `const a = 1`
    const code = transform(file, function (ast) {
      return ast
    })

    expect(code).toEqual(file)
  })

  it('it should return const b = 1', () => {
    const file = `const a = 1`
    const code = transform(file, function (program) {
      program.find(j.Identifier).forEach(path => {
        j(path).replaceWith(
          j.identifier('b')
        );
      })
      return program
    })

    expect(code).toEqual(`const b = 1`)
  })
})
