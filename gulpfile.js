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
    browserSync = require('browser-sync');


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
        .pipe(data(getJsonData))
        .pipe(foreach(function(stream,file){
            return stream
                .pipe(twig())
        }))
        .pipe(gulp.dest('compiled/'))
        .pipe(browserSync.reload({stream:true}));
});


gulp.task('less', function(){
  gulp.src(['src/less/all.less'])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(less())
    .pipe(concat('all.min.css'))
    //.pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('compiled/styles/'))
    .pipe(browserSync.reload({stream:true}))
});

gulp.task('scripts', function(){
  return gulp.src(['src/scripts/libs/*.js','src/scripts/*.js'])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(concat('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('compiled/scripts/'))
    .pipe(browserSync.reload({stream:true}))
});

gulp.task('mulch-compile',['less','scripts','twig']);

gulp.task('mulch',['mulch-compile','browser-sync'],function(){
    gulp.watch("src/less/**/*.less", ['less']);
    gulp.watch("src/scripts/**/*.js", ['scripts']);
    gulp.watch('src/data/*.json',['data']);
    gulp.watch(['src/templates/**/*.html','src/_compiled.json'],['twig']);
    gulp.watch("compiled/**/*.html",['bs-reload']);
});
