import j from 'jscodeshift'
import { Collection } from 'jscodeshift/src/Collection'

export type Transformer = (
  program: Collection<j.Program>
) => Collection<j.Program>
