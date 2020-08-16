module.exports = {
  presets: ['@babel/preset-typescript', '@babel/preset-env'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          // '@ko/builder'
          // '@ko/package-manager': './packages/package-manager',
          '@ko': ([, name]) => {
            if (name.includes('utils')) return './utils'
            if (name.includes('types')) return './types'
            console.log(name)
            return `./packages${name}`
          },
        },
      },
    ],
    '@babel/plugin-syntax-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-transform-typescript',
    '@babel/plugin-proposal-class-properties',
  ],
  ignore: [
    '__test__',
    'src/**/__test__/**',
    'output/**',
    '**/output/**',
    '**/**/output/**',
    '**/**/**/output/**',
    '**/**/**/**/output/**',
  ],
}
