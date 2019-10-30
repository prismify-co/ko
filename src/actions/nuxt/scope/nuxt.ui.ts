import {existsSync} from 'fs'
import {join} from 'path'

export const CASTLE_SCOPE_UI_PATH = join(__dirname, '..', '..', '..', 'configurations', 'nuxt', 'ui')

export default async function ui(configuration: any) {
  if (!configuration.scope) {
    throw new Error('No scope specified')
  }

  // Grab the framework
  const framework = configuration.scope.ui
  // Grab the framework name
  const name = Object.keys(framework)[0]
  // Grab the framework version
  const {version} = framework[name]

  // Remove configuration
  delete configuration.scope

  // Set the framework directory
  const CASTLE_SCOPE_UI_DIR = join(CASTLE_SCOPE_UI_PATH, name)

  // Check if it's supported
  if (existsSync(CASTLE_SCOPE_UI_DIR)) {
    const main = await import(join(CASTLE_SCOPE_UI_DIR, 'main'))
    return main(version)
  }
  return
}
