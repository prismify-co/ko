import next from './next'
import { CreateContext } from '@ko/types'

export default function ({
  framework,
  typescript = true,
  ...rest
}: CreateContext) {
  switch (framework) {
    case 'nuxt':
      return
    case 'next':
      return next({ framework, typescript, ...rest })
    case 'sapper':
      return
    default:
      return
  }
}
