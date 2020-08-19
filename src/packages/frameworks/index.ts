import next from './next'
import { CreateContext } from '@ko/types'

export default function ({
  framework,
  typescript = true,
  ...rest
}: CreateContext) {
  switch (framework) {
    case 'next':
      return next({ typescript, ...rest })
    default:
      return
  }
}
