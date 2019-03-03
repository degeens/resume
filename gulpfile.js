var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var rename = require('gulp-rename');

var paths = {
  html: './**/*.html',
  server: './',
  styles: {
    src: './scss/**/*.scss',
    dest: './css'
  }
};

gulp.task('serve', function() {
  browserSync.init({ server: paths.server });

  gulp.watch(paths.styles.src, gulp.series('styles'));
  gulp.watch(paths.html).on('change', browserSync.reload);
});
 
gulp.task('styles', function() {
  return gulp.src(paths.styles.src)
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
});

gulp.task('default', gulp.series('serve'));