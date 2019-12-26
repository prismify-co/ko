import { html } from 'common-tags'
import dbg = require('debug')
import { writeFileSync } from 'fs'
import { join } from 'path'
import { cd, mkdir } from 'shelljs'
import { promisify } from 'util'

import { Package } from '../../modules/main'
import * as config from '../../utils/config'
const GithubContent = require('github-content')

const debug = dbg('ko:actions:nuxt:create')

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
  debug(`ko [info]: creating directory ${name}`)
  mkdir('-p', root)

  // Create the package.json file
  debug('ko [info]: writing package.json')
  writeFileSync(join(root, 'package.json'),
    `{
      "name": "${name}",
      "scripts": {
        "dev": "nuxt",
        "build": "nuxt build",
        "build:analyze": "nuxt build --analyze",
        "start": "nuxt start"
      },
      "license": "MIT"
    }`, 'utf8'
  )

  // Create the nuxt.config.js file
  debug('ko [info]: writing nuxt.config.js')
  writeFileSync(join(root, 'nuxt.config.js'),
    'module.exports = {}', 'utf8'
  )

  // CD into cwd/name
  debug(`ko [info]: cd ${root}`)
  cd(root)

  // Install nuxt
  debug(`ko [info]: installing nuxt@${version}`)
  await Package.add([{
    name: 'nuxt',
    version,
    dev: false
  }], { silent: true })
  // Create the pages directory
  debug('ko [info]: creating nuxt directories')
  mkdir('assets', 'components', 'layouts', 'middleware', 'pages', 'plugins', 'static', 'store')

  // Create the first page
  debug('ko [info]: creating index.vue')
  writeFileSync(join(root, 'pages', 'index.vue'), html`
    <div>
      <h1>Made with ko</h1>
    </div>
  `,
    'utf8'
  )

  // Write the configuration file
  debug('ko [info]: initializing configuration file')
  config.init({ name, framework: { name: framework, version } })

  // Download the latest gitignore for node
  debug('ko [info]: downloading .gitignore for node')
  const gitignore = await download.apply(gc, ['Node.gitignore'])

  // Write the .gitignore file
  debug(`ko [info]: writing .gitignore to ${root}`)
  writeFileSync(join(root, '.gitignore'), gitignore.contents.toString(), 'utf8')
}
