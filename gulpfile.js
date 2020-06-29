const gulp = require('gulp')
const ts = require('gulp-typescript')
const fileinclude = require('gulp-file-include')
const tsProject = ts.createProject('tsconfig.json')
const uglify = require('gulp-uglify')
// const rename = require('gulp-rename')
// const concat = require('gulp-concat')
const nodemon = require('gulp-nodemon')
const sourcemaps = require('gulp-sourcemaps')
const buffer = require('vinyl-buffer')
const version = 'v1.4.0'
const basename = 'app'
gulp.task('build', function () {
  return (
    tsProject
      .src()
      .pipe(tsProject())
      .js.pipe(buffer())
      // .pipe(concat('all.js'))
      .pipe(buffer())
      .pipe(
        sourcemaps.init({
          loadMaps: true,
        })
      )
      .pipe(fileinclude())
      .pipe(uglify())
      .pipe(gulp.dest('dist'))
  )
})

gulp.task('dev', () => {
  return nodemon({
    script: 'src/entry.ts',
    env: {
      NODE_ENV: 'development',
    },
  })
})
