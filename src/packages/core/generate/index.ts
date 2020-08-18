import { CreateContext } from '../../../types'
import next from './next'

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
