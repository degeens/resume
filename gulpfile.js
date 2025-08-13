const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const fs = require('fs');
const path = require('path');
const merge = require('merge-stream');
const file = require('gulp-file');
var log = require('fancy-log');

const paths = {
  html: {
    src: './src/**/*.html',
    dest: './dist'
  },
  img: {
    src: './src/assets/img/**/*',
    dest: './dist/assets/img'
  },
  css: {
    src: './src/assets/css/**/*.css',
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
      
      const destPath = `${paths.html.dest}/${language}`;
      removeFiles(destPath);

      let htmlStream = gulp.src(paths.html.src);

      Object
        .keys(translations)
        .forEach(key => {
          htmlStream = htmlStream.pipe(replace(`{{${key}}}`, translations[key]));
        });

      htmlStream = htmlStream.pipe(gulp.dest(destPath));

      mergedStream.add(htmlStream);
  });

  return mergedStream;
});

gulp.task('create-redirect', function () {
  const html = 
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
        window.location.href = './en';
      } else {
        // Redirect to the appropriate language directory
        window.location.href = './' + lang;
      }
    </script>
  </head>
  <body>
    <p>Redirecting you to the correct language version...</p>
  </body>
  </html>`;

  return file('index.html', html, { src: true })
    .pipe(gulp.dest('./dist'));
});

gulp.task('create-404', function () {
  const html = 
  `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Stijn Geens</title>
  </head>
  <body>
    <p>404: It looks like this page took a coffee break.</p>
  </body>
  </html>`;

  return file('404.html', html, { src: true })
    .pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', function() {
  removeFiles(paths.img.dest);
  
  return gulp.src(paths.img.src, { encoding: false })
    .pipe(gulp.dest(paths.img.dest));
});

gulp.task('css', function() {
  removeFiles(paths.css.dest);
  
  return gulp.src(paths.css.src)
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.css.dest));
});

gulp.task('watch', function() {
  gulp.watch(paths.html.src, gulp.series('translate'));
  gulp.watch(paths.translations, gulp.series('translate'));
  gulp.watch(paths.img.src, gulp.series('copy-images'));
  gulp.watch(paths.css.src, gulp.series('css'));
});

gulp.task('default', gulp.series('translate', 'create-redirect', 'create-404', 'copy-images', 'css', 'watch'));

function removeFiles(directory) {
  if (!fs.existsSync(directory)) { 
    return;
  }

  log(`Removing files in ${directory}`);

  fs
    .readdirSync(directory)
    .forEach(file => {
      const filePath = path.join(directory, file);

      fs.rmSync(filePath);
    });
}
