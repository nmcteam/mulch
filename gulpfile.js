// Requires
var fs = require('fs'),
    path = require('path'),

    browserSync = require('browser-sync'), // node packages
    glob = require('glob'),
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    data = require('gulp-data'),
    foreach = require('gulp-foreach'),
    lazypipe = require('lazypipe')
    less = require('gulp-less'),
    minifycss = require('gulp-minify-css'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    twig = require('gulp-twig'),
    uglify = require('gulp-uglify'),
    minimist = require('minimist'),
    runSequence = require('run-sequence')
;


/* BrowserSync */
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: 'compiled/'
        }
    })
});

gulp.task('bs-reload', function () {
   browserSync.reload();  
});


/* Styles */
var knownOptions = { // CLI support
  string: 'p',
  default: { p: process.env.NODE_ENV || 'less' }
};
var options = minimist(process.argv.slice(2), knownOptions);

var mulchCompiledStyles = lazypipe()
    .pipe(concat, 'all.min.css')
    .pipe(minifycss)
    .pipe(gulp.dest, 'compiled/styles/')
    .pipe(browserSync.reload, { stream: true })
;
gulp.task('styles-css', function(){ // css (choose by running `gulp css mulch`)
  gulp.src('src/styles/all.css')
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(less())
    .pipe(mulchCompiledStyles())
});
gulp.task('styles-less', function(){ // less (default)
  gulp.src('src/styles/all.less')
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(less())
    .pipe(mulchCompiledStyles())
});
gulp.task('styles-sass', function() { // sass (choose by running 'gulp sass mulch')
    gulp.src('src/styles/all.sass')
        .pipe(plumber({
            errorHandler: function(error) {
                console.log(error.message);
                this.emit('end');
            }
        }))
        .pipe(sass())
        .pipe(mulchCompiledStyles())
});
gulp.task('styles-scss', function() { // sass (choose by running 'gulp sass mulch')
    gulp.src('src/styles/all.scss')
        .pipe(plumber({
            errorHandler: function(error) {
                console.log(error.message);
                this.emit('end');
            }
        }))
        .pipe(sass())
        .pipe(mulchCompiledStyles())
});
gulp.task('styles', function() {
    if ( options.p == 'less' ) {
        runSequence('styles-less')
    } else if ( options.p == 'scss') {
        runSequence('styles-scss')
    } else if ( options.p == 'sass' ) {
        runSequence('styles-sass')
    } else if ( options.p == 'css' ) {
        runSequence('styles-css')
    }
});
gulp.task('styles-watch',['styles'],browserSync.reload);


/* Twig Templates */
function getJsonData (file, cb) {
    glob("src/data/*.json", {}, function(err, files) {
        var data = {};
        if (files.length) {
            files.forEach(function(fPath){
                var baseName = path.basename(fPath, '.json');
                data[baseName] = JSON.parse(fs.readFileSync(fPath));
            });
        }
        cb(undefined, data);
    });
}
gulp.task('twig',function(){
    return gulp.src('src/templates/urls/**/*.html')
        .pipe(plumber({
          errorHandler: function (error) {
            console.log(error.message);
            this.emit('end');
        }}))
        .pipe(data(getJsonData))
        .pipe(foreach(function(stream,file){
            return stream
                .pipe(twig())
        }))
        .pipe(gulp.dest('compiled/'));
});
gulp.task('twig-watch',['twig'],browserSync.reload);


/* Scripts */
gulp.task('scripts', function(){
  return gulp.src(['src/scripts/libs/*.js','src/scripts/*.js'])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(concat('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('compiled/scripts/'));
});
gulp.task('scripts-watch',['scripts'],browserSync.reload);


/* Mulch */
gulp.task('mulch-compile',['styles','scripts','twig']);

gulp.task('mulch',['mulch-compile','browser-sync'],function(less){
    gulp.watch('src/styles/**/*.+(css|less|sass|scss)', ['styles-watch']);
    gulp.watch("src/scripts/**/*.js", ['scripts-watch']);
    gulp.watch(['src/templates/**/*.html','src/data/*.json'],['twig-watch']);
});
