import nuxt from './nuxt/main'

export default function (name: string, framework: string, version: string) {
  switch (framework) {
  case 'nuxt':
    return nuxt(name, framework, version)
  case 'next':
  case 'sapper':
    return
  default:
    return
  }
}
