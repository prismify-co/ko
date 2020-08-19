import { Generator } from '@ko/generator'
import { CreateContext } from '@ko/types/contexts'
import { GeneratorOptions } from '@ko/generator/types'

export type FrameworkFactory = (
  context: Omit<CreateContext, 'framework'> & GeneratorOptions
) => Generator
