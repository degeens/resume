'use strict';
 
var gulp = require('gulp');
var rename = require('gulp-rename');
var sass = require('gulp-sass');

var paths = {
  styles: {
    src: './scss/**/*.scss',
    dest: './css'
  }
};
 
gulp.task('style', function () {
  return gulp.src(paths.styles.src)
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(paths.styles.dest));
});
 
gulp.task('style:watch', function () {
  gulp.watch(paths.styles.src, ['style']);
});