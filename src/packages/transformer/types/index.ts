import { builders } from 'ast-types/gen/builders'
import { NamedTypes } from 'ast-types/gen/namedTypes'
import { types } from 'recast'

export type Transformer = (
  ast: types.ASTNode,
  builder: builders,
  types: NamedTypes
) => types.ASTNode
