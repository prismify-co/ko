import { writeFileSync } from 'fs'
import { join } from 'path'
import { cd, exec, mkdir } from 'shelljs'
import { promisify } from 'util'

import * as config from '../../utils/config'
const GithubContent = require('github-content')

const gc = new GithubContent({
  owner: 'github',
  repo: 'gitignore'
})

const download: (param: any) => Promise<{
  path: string,
  contents: Buffer
}> = promisify(gc.file) as any

export default async function create(name: string, framework: string, version: string) {
  const cwd = process.cwd()
  const root = join(cwd, name)

  // Create the project folder
  mkdir('-p', root)

  // Create the package.json file
  writeFileSync(join(root, 'package.json'),
    `{
      "name": "${name}",
      "scripts": {
        "dev": "nuxt",
        "build": "nuxt build",
        "build:analyze": "nuxt build --analyze",
        "start": "nuxt start"
      }
    }`, 'utf8'
  )

  // Create the nuxt.config.js file
  writeFileSync(join(root, 'nuxt.config.js'),
    'module.exports = {}', 'utf8'
  )

  // CD into cwd/name
  cd(root)

  // Install nuxt
  exec(`yarn add nuxt@${/[0-9]+/g.test(version) ? `v${version}` : version}`)

  // Create the pages directory
  mkdir('assets', 'components', 'layouts', 'middleware', 'pages', 'plugins', 'static', 'store')

  // Create the first page
  writeFileSync(join(root, 'pages', 'index.vue'),
    '<template>\n<h1>Hello world!</h1>\n</template>',
    'utf8'
  )

  // Write the configuration file
  config.init({ name, framework: { name: framework, version } })

  // Download the latest gitignore for node
  const gitignore = await download.apply(gc, ['Node.gitignore'])

  // Write the .gitignore file
  writeFileSync(join(root, '.gitignore'), gitignore.contents.toString(), 'utf8')
}
