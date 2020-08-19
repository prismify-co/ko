import { parse, print, types } from 'recast'
import { namedTypes, NamedTypes } from 'ast-types/gen/namedTypes'
import { customTsParser } from '..'
import { ASTNode } from 'ast-types'
import { builders } from 'ast-types/gen/builders'

const b = types.builders

function addImport(
  ast: ASTNode,
  __b: builders,
  t: NamedTypes,
  importToAdd: types.namedTypes.ImportDeclaration
) {
  if (!t.File.check(ast) || !t.ImportDeclaration.check(importToAdd)) return
  const statements = ast.program.body
  if (statements.length > 0 && !t.ImportDeclaration.check(statements[0])) {
    ast.program.body.splice(0, 0, importToAdd)
  } else {
    const idx = ast.program.body.findIndex((node) =>
      t.ImportDeclaration.check(node)
    )
    ast.program.body.splice(idx + 1, 0, importToAdd)
  }
  return ast
}

function executeImport(
  fileStr: string,
  importStatement: types.namedTypes.ImportDeclaration
): string {
  return print(
    addImport(
      parse(fileStr, { parser: customTsParser }) as types.namedTypes.File,
      types.builders,
      namedTypes,
      importStatement
    ) as types.namedTypes.File
  ).code
}

describe('packages/transformer', () => {
  it('should add import at start of file with no imports present', () => {
    const file = `export const truth = () => 42`
    const importStatement = b.importDeclaration(
      [b.importDefaultSpecifier(b.identifier('React'))],
      b.literal('react')
    )
    expect(executeImport(file, importStatement)).toMatchSnapshot()
  })

  it('should add import at the end of all imports if imports are present', () => {
    const file = `import React from 'react'
export default function Comp() {
  return <div>hello world!</div>
}`
    const importStatement = b.importDeclaration(
      [],
      b.literal('app/styles/app.css')
    )
    expect(executeImport(file, importStatement)).toMatchSnapshot()
  })
})
