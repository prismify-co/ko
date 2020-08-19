import { Generator } from '@ko/generator'
import { CreateContext } from '@ko/types'

export type FrameworkFactory = (
  context: Omit<CreateContext, 'framework'>
) => Generator
