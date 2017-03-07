const gulp        = require('gulp'),
      browserSync = require('browser-sync'),
      reload      = browserSync.reload,
      sass        = require('gulp-sass'),
      cp          = require('child_process'),
      rename      = require('gulp-rename'),
      cssmin      = require('gulp-clean-css'),
      concat      = require('gulp-concat'),
      uglify      = require('gulp-uglify'),
      jshint      = require('gulp-jshint'),
      scsslint    = require('gulp-sass-lint'),
      cache       = require('gulp-cached'),
      prefix      = require('gulp-autoprefixer'),
      minifyHTML  = require('gulp-minify-html'),
      size        = require('gulp-size'),
      imagemin    = require('gulp-imagemin'),
      pngquant    = require('imagemin-pngquant'),
      plumber     = require('gulp-plumber'),
      deploy      = require('gulp-gh-pages'),
      notify      = require('gulp-notify');


var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( 'jekyll', ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    return gulp.src('_scss/main.scss')
        .pipe(sass())
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('css'))
        .pipe(cssmin())
        .pipe(rename('main.min.css'))
        .pipe(gulp.dest('css'))
        .pipe(reload({stream:true}))
        .pipe(gulp.dest('_site/css'));
});


/**
 * Deploy _site to GH pages
 */
gulp.task('deploy', ['jekyll-build'], function () {
  return gulp.src('./_site/**/*')
          .pipe(deploy());
});

/**
 * Minify images
 */
gulp.task('imagemin', function () {
  return gulp.src('images/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('_site/images'));
});

/**
 * Lint .scss
 */
// gulp.task('scss-lint', function () {
//   gulp.src('_scss/**/*/.scss')
//     .pipe(scsslint({
//       'bundleExec': true,
//       'config':
//     }))
// })

/**
 * Minify, concat js files send to _site dir and reload
 */
gulp.task('js', function () {
  gulp.src('scripts/*.js')
    .pipe(uglify())
    .pipe(size({ gzip: true, showFiles: true}))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('_site/scripts'))
    .pipe(reload({stream: true}));
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('_scss/**/*.scss', ['sass', 'jekyll-build']);
    gulp.watch('scripts/main.js', ['js', 'jekyll-build']);
    gulp.watch(['*.html', '_layouts/*.html', 'about/*.html', 'services/*.html', 'our-professionals/*.html', 'news/*.html', 'contact/*.html', 'careers/*.html', '_posts/**/*', '_includes/**/*', '*.css', '*.js'], ['jekyll-rebuild']);
    gulp.watch(['images/*'], ['imagemin'])
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);
