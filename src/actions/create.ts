import next from './next'
import { CreateContext } from '../types'

export default function ({
  name,
  framework,
  version,
  typescript,
}: CreateContext) {
  switch (framework) {
    case 'nuxt':
      return
    case 'next':
      return next(name, framework, version, typescript)
    case 'sapper':
      return
    default:
      return
  }
}
