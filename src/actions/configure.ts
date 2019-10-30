import * as config from '../utils/config'

import nuxt from './nuxt/main'
export default function (scope: string) {
  const configuration = config.load()
  if (!configuration.framework) {
    return
  }
  switch (Object.keys(configuration.framework)[0]) {
  case 'nuxt':
    return nuxt.configure(scope, configuration)
  case 'next':
  case 'sapper':
    return
  default:
    return
  }
}
