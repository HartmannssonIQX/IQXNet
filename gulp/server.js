var gulp    = require('gulp')
var nodemon = require('gulp-nodemon')

gulp.task('dev:server', function () {
  nodemon({
    script: 'server.js',
    ext:    'js',
    ignore: ['cliControllers/**/*', 'assets/**/*', 'dump/**/*', 'test/**/*']
  })
})
