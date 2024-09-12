const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const fs = require('fs');
const path = require('path');
const merge = require('merge-stream');
const file = require('gulp-file');

var paths = {
  html: {
    src: './src/**/*.html',
    dest: './dist/lang'
  },
  img: {
    src: './src/assets/img/**/*',
    dest: './dist/assets/img'
  },
  sass: {
    src: './src/assets/scss/**/*.scss',
    dest: './dist/assets/css'
  },
  translations: './src/translations/**/*.json'
};

gulp.task('translate', function() {
  const mergedStream = merge();

  fs
    .readdirSync('src/translations')
    .forEach(translationFile => {
      const language = path.basename(translationFile, '.json');
      const translations = JSON.parse(fs.readFileSync(`src/translations/${translationFile}`));

      let htmlStream = gulp.src(paths.html.src);

      Object
        .keys(translations)
        .forEach(key => {
          htmlStream = htmlStream.pipe(replace(`{{${key}}}`, translations[key]));
        });

      htmlStream = htmlStream.pipe(gulp.dest(`${paths.html.dest}/${language}`))

      mergedStream.add(htmlStream);
  });

  return mergedStream;
});

gulp.task('create-redirect', function () {
  const redirectHtml = 
  `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirecting...</title>
    <script>
      // Detect browser language
      const userLang = navigator.language || navigator.userLanguage;
      const lang = userLang.split('-')[0]; // Get language code (e.g., 'en' from 'en-US')

      // Define supported languages
      const supportedLanguages = ['en', 'nl'];

      // Default to 'en' if language is not supported
      if (!supportedLanguages.includes(lang)) {
        window.location.href = './lang/en/index.html';
      } else {
        // Redirect to the appropriate language directory
        window.location.href = './lang/' + lang + '/index.html';
      }
    </script>
  </head>
  <body>
    <p>Redirecting you to the correct language version...</p>
  </body>
  </html>`;

  return file('index.html', redirectHtml, { src: true })
    .pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', function() {
  return gulp.src(paths.img.src, { encoding: false })
  .pipe(gulp.dest(paths.img.dest));
})
 
gulp.task('sass', function() {
  return gulp.src(paths.sass.src)
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.sass.dest));
});

gulp.task('watch', function() {
  gulp.watch(paths.html.src, gulp.series('translate'));
  gulp.watch(paths.translations, gulp.series('translate'));
  gulp.watch(paths.img.src, gulp.series('copy-images'));
  gulp.watch(paths.sass.src, gulp.series('sass'));
});

gulp.task('default', gulp.series('translate', 'create-redirect', 'copy-images', 'sass', 'watch'));