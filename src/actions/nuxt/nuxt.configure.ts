import ui from './scope/nuxt.ui'
export default function configure(scope: string, configuration: any) {
  switch (scope) {
  case 'ui':
    return ui(configuration)
  default:
    return
  }
}
