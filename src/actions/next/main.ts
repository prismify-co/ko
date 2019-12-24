import dbg = require('debug')
import { writeFileSync } from 'fs'
import { join } from 'path'
import { cd, exec, mkdir } from 'shelljs'
import { promisify } from 'util'

import * as config from '../../utils/config'
const GithubContent = require('github-content')

const debug = dbg('ko:actions:next:create')

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
        "dev": "next",
        "build": "next build",
        "build:analyze": "next build --analyze",
        "start": "next start"
      },
      "dependencies": {
        "react": "^16.12.0",
        "react-dom": "^16.12.0"
      },
      "license": "MIT"
    }`, 'utf8'
  )

  // Create the next.config.js file
  debug('ko [info]: writing next.config.js')
  writeFileSync(join(root, 'next.config.js'),
    'module.exports = {}', 'utf8'
  )

  // CD into cwd/name
  debug(`ko [info]: cd ${root}`)
  cd(root)

  // Install next
  debug(`ko [info]: installing next@${/[0-9]+/g.test(version) ? `v${version}` : version}`)
  exec(`yarn add -s next@${/[0-9]+/g.test(version) ? `v${version}` : version}`)

  // Create the pages directory
  debug('ko [info]: creating next directories')
  mkdir('assets', 'components', 'pages', 'public')

  // Create the first page
  debug('ko [info]: creating index.jsx')
  writeFileSync(join(root, 'pages', 'index.jsx'),
    `import React from 'react'

    export default () => {
      return
      (<div>
        <h1> Hello World! </h1>
      </div>)
    }`,
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
