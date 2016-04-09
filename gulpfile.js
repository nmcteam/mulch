// Requires
var gulp = require('gulp'),
    fs = require('fs'),
    glob = require('glob'),
    path = require('path'),
    data = require('gulp-data'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifycss = require('gulp-minify-css'),
    less = require('gulp-less'),
    twig = require('gulp-twig'),
    foreach = require('gulp-foreach'),
    browserSync = require('browser-sync'),
    sass = require('gulp-sass'),
    runSequence = require('run-sequence'),
    lazypipe = require('lazypipe'),

    flags = {
        preprocessor: 'less'
    }
;


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
var mulchStyles = lazypipe()
    .pipe(concat, 'all.min.css')
    .pipe(minifycss)
    .pipe(gulp.dest, 'compiled/styles/')
    .pipe(browserSync.reload, { stream: true })
;
gulp.task('styles-less', function(){
  gulp.src('src/styles/all.less')
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(less())
    .pipe(mulchStyles())
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
        .pipe(mulchStyles())
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
        .pipe(mulchStyles())
});
gulp.task('scss', function () {
    flags.preprocessor = 'scss'
});
gulp.task('sass', function () {
    flags.preprocessor = 'sass'
});
gulp.task('styles', function() {
    if ( flags.preprocessor == 'scss' ) {
        runSequence('styles-scss')
    } else if (flags.preprocessor == 'sass') {
        runSequence('styles-sass')
    } else {
        runSequence('styles-less')
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
    gulp.watch('src/styles/**/*.+(less|scss|sass)', ['styles-watch']);
    gulp.watch("src/scripts/**/*.js", ['scripts-watch']);
    gulp.watch(['src/templates/**/*.html','src/data/*.json'],['twig-watch']);
});
