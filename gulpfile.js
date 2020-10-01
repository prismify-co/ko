const { series, src, dest } = require('gulp')
// const babel = require('gulp-babel')

// function build() {
//   return src('./src/**/*.ts').pipe(babel()).pipe(dest('lib'))
// }

function copy() {
  return src([
    'src/**/*.txt',
    'src/**/*.css',
    'src/**/types/*.ts',
    'src/**/**/types/*.ts',
  ]).pipe(dest('lib'))
}

exports.default = series(copy)
