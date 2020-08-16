import dbg from 'debug'

import handlebars from 'handlebars'
import { join, resolve } from 'path'
import { cd, mkdir, touch } from 'shelljs'
import git from 'simple-git'
import { promisify } from 'util'
import config, { Framework } from '../../../config'
import pkgm from '@ko/package-manager'
import { mkpdir } from '@ko/utils/mkpdir'
import { write, read } from '@ko/utils/fs'

const GithubContent = require('github-content')

const debug = dbg('ko:actions:next:create')

const gc = new GithubContent({
  owner: 'github',
  repo: 'gitignore',
})

const download: (
  param: any
) => Promise<{
  path: string
  contents: Buffer
}> = promisify(gc.file) as any

export default async function create(
  name: string,
  framework: string,
  version: string,
  typescript: boolean
) {
  const cwd = process.cwd()
  const root = join(cwd, name)
  const templatesPath = join(__dirname, 'templates')

  // Create the project folder
  debug(`ko [info]: creating directory ${name}`)
  mkpdir(name)

  // Create the package.json file
  debug('ko [info]: writing package.json')
  const pkg = read(join(__dirname, 'templates', 'package.txt'))
  write(
    join(root, 'package.json'),
    handlebars.compile(pkg)({
      name,
    })
  )

  // Create the next.config.js file
  debug('ko [info]: writing next.config.js')
  write(
    join(root, 'next.config.js'),
    read(join(templatesPath, 'next.config.txt'))
  )

  // CD into cwd/name
  debug(`ko [info]: cd ${root}`)
  cd(root)

  // Initialize git
  await git(root).init()

  // Install next
  debug(`ko [info]: installing next@${version}`)
  await pkgm().add(
    [
      version === 'latest' || !version ? 'next' : { name: 'next', version },
      'react',
      'react-dom',
      ...(typescript
        ? [
            { name: 'typescript', dev: true },
            { name: '@types/node', dev: true },
            { name: '@types/react', dev: true },
          ]
        : []),
    ],
    { silent: true, cwd: root }
  )

  if (typescript) {
    // Create a tsconfig.json for next.json to fill it out
    debug('ko [info]: creating tsconfig.json')
    touch('tsconfig.json')
  }

  // Create the directories
  debug('ko [info]: creating next directories')
  mkdir('-p', 'assets', 'components', 'pages', 'public', 'styles')

  // Create the initial pages
  debug('ko [info]: creating files under pages/')
  const pages = ['_app.txt', '_document.txt', 'index.txt']

  for (const file of pages) {
    const script = file.replace('txt', typescript ? 'tsx' : 'js')
    const page = read(join(templatesPath, `pages/${file}`))
    write(resolve(`pages/${script}`), handlebars.compile(page)({ name }))
  }

  // Create the initial styles
  debug('ko [info]: creating files under styles/')
  const styles = ['globals.css', 'home.module.css']
  for (const file of styles) {
    write(
      resolve(`styles/${file}`),
      read(join(templatesPath, `styles/${file}`))
    )
  }

  // Write the configuration file
  debug('ko [info]: initializing configuration file')
  config({ name, framework: { name: framework as Framework, version } }).init()

  // Download the latest gitignore for node
  debug('ko [info]: downloading .gitignore for node')
  const gitignore = await download.apply(gc, ['Node.gitignore'])

  // Write the .gitignore file
  debug(`ko [info]: writing .gitignore to ${root}`)
  write(resolve('.gitignore'), gitignore.contents.toString('utf-8'))

  debug(`ko [info]: Add changes to git`)
  await git(root).add('*')
  // Add the changes to the commit
  await git(root).commit('Add initial files')
}
