import dbg from 'debug'

import handlebars from 'handlebars'
import { join, resolve } from 'path'
import { mkdir, touch } from 'shelljs'
import { promisify } from 'util'
import { write, read, readJSON, writeJSON } from '@ko/utils/fs'
import generator from '@ko/generator'
import { CreateContext } from '@ko/types'

const GithubContent = require('github-content')

const debug = dbg('ko:core:generate:next')

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

export default async function next({
  name,
  framework,
  version,
  typescript,
}: CreateContext) {
  const templatesPath = join(__dirname, 'templates')

  await generator(name, framework)
    .addDependencyStep({
      name: 'Add initial dependencies',
      packages: [
        { name: 'next', version },
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
    })
    .addCustomStep({
      name: 'Add scripts to package.json',
      run: () => {
        const pkgPath = resolve('package.json')
        const pkg = readJSON(pkgPath)
        writeJSON(pkgPath, {
          ...pkg,
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start',
          },
        })
      },
    })
    .addCustomStep({
      name: 'Add next.config.js',
      run: () => {
        debug('Creating next.config.json')
        write(
          resolve('next.config.js'),
          read(join(templatesPath, 'next.config.txt'))
        )
      },
    })
    .addCustomStep({
      name: 'Initialize tsconfig.json',
      run: () => {
        debug('Creating tsconfig.json')
        touch('tsconfig.json')
      },
      condition: typescript !== false,
    })
    .addCustomStep({
      name: 'Create the directories',
      run: () => {
        // Create the directories
        debug('Creating next directories')
        mkdir('-p', 'assets', 'components', 'pages', 'public', 'styles')
      },
    })
    .addCustomStep({
      name: 'Create initial pages',
      run: () => {
        // Create the initial pages
        debug('Creating files under pages/')
        const pages = ['_app.txt', '_document.txt', 'index.txt']

        for (const file of pages) {
          const script = file.replace('txt', typescript ? 'tsx' : 'js')
          const page = read(join(templatesPath, `pages/${file}`))
          write(resolve(`pages/${script}`), handlebars.compile(page)({ name }))
        }
      },
    })
    .addCustomStep({
      name: 'Create the initial styles',
      run: () => {
        // Create the initial styles
        debug('Creating files under styles/')
        const styles = ['globals.css', 'home.module.css']
        for (const file of styles) {
          write(
            resolve(`styles/${file}`),
            read(join(templatesPath, `styles/${file}`))
          )
        }
      },
    })
    .addCustomStep({
      name: 'Initialize .gitignore',
      run: async () => {
        // Download the latest gitignore for node
        debug('Downloading .gitignore for node')
        const gitignore = await download.apply(gc, ['Node.gitignore'])
        // Write the .gitignore file
        debug(`Writing .gitignore to ${process.cwd()}`)
        write(resolve('.gitignore'), gitignore.contents.toString('utf-8'))
      },
    })
    .generate()
}
