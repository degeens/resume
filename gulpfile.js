'use strict';
 
var gulp = require('gulp');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
 
gulp.task('style', function () {
  return gulp.src('./scss/**/*.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./css'));
});
 
gulp.task('style:watch', function () {
  gulp.watch('./scss/**/*.scss', ['style']);
});