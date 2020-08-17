const { resolve } = require('path')

module.exports = {
  presets: [
    '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        targets: {
          node: true,
        },
      },
    ],
  ],
  plugins: [
    '@babel/plugin-syntax-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-transform-typescript',
    '@babel/plugin-proposal-class-properties',
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        root: [resolve('./')],
        alias: {
          '@ko': ([, name]) => {
            if (name.includes('types')) return `./${name}`
            return `./src/packages/${name}`
          },
        },
      },
    ],
  ],
  ignore: ['src/packages/**/__test__/**'],
}
