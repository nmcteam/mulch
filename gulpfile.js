// Requires
var gulp = require('gulp'),

    fs = require('fs'),
    browserSync = require('browser-sync'),
    glob = require('glob'),
    changed = require('gulp-changed'),
    cleancss = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    data = require('gulp-data'),
    del = require('del'),
    dirSync = require('gulp-directory-sync'),
    foreach = require('gulp-foreach'),
    imagemin = require('gulp-imagemin'),
    less = require('gulp-less'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    twig = require('gulp-twig'),
    uglify = require('gulp-uglify'),
    path = require('path'),
    runSequence = require('run-sequence');


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

/* LESS */
gulp.task('less', function(){
  gulp.src(['src/less/all.less'])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(less())
    .pipe(concat('all.min.css'))
    .pipe(cleancss())
    .pipe(gulp.dest('compiled/styles/'))
    .pipe(browserSync.reload({stream:true}))
});


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

/* Images */
gulp.task('images-compress', function(){
    return gulp.src('src/images/*')
        .pipe(plumber({
          errorHandler: function (error) {
            console.log(error.message);
            this.emit('end');
        }}))
        .pipe(changed('compiled/images'))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [
                {removeViewBox: false},
                {cleanupIDs: false}
            ]
        }))
        .pipe(gulp.dest('src/images'));
});
gulp.task('images', ['images-compress'], function() {
    return gulp.src('src/images/*')
        .pipe(plumber({
          errorHandler: function (error) {
            console.log(error.message);
            this.emit('end');
        }}))
        .pipe(changed('compiled/images'))
        .pipe(gulp.dest('compiled/images'))
});

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
gulp.task('mulch-compile',['less','scripts','twig','images']);

gulp.task('mulch-clean', function(){
    del('compiled/')
});

gulp.task('mulch-process', function(){
    runSequence('mulch-clean','mulch-compile','browser-sync');
});

gulp.task('mulch',['mulch-process'],function(){
    gulp.watch("src/less/**/*.less", ['less']);
    gulp.watch("src/scripts/**/*.js", ['scripts-watch']);
    gulp.watch(['src/templates/**/*.html','src/data/*.json'],['twig-watch']);
    gulp.watch('src/images/**/*', ['images']);
});
