const { exec, cd } = require('shelljs')
const { readFileSync, writeFileSync } = require('fs')
const { join } = require('path')
const configure = require('./configure')

module.exports = function tailwindcss (version) {
  // Grab the current working directory
  const cwd = process.cwd()

  // Make sure we're in the right directory
  cd (cwd)

  // Install tailwindcss for nuxt
  exec(`yarn add -D @nuxtjs/tailwindcss@${version}`)

  // Read the nuxt config file
  const nuxtConfig = readFileSync(join(cwd, 'nuxt.config.js')).toString()

  // Configure the nuxt config file
  const modifiedNuxtConfig = configure(nuxtConfig)

  // Write the new configuration file for nuxt
  writeFileSync(join(cwd, 'nuxt.config.js'), modifiedNuxtConfig, 'utf8')
}
