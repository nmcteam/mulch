// Requires
var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifycss = require('gulp-minify-css'),
    less = require('gulp-less'),
    twig = require('gulp-twig'),
    foreach = require('gulp-foreach'),
    jsoncombine = require('gulp-jsoncombine'),
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

gulp.task('data',function(){
    return gulp.src("src/data/*.json")
        .pipe(jsoncombine("_compiled.json",function(data){
            return new Buffer(JSON.stringify(data));
         }))
         .pipe(gulp.dest('src/'));
});

gulp.task('twig',function(){
    var dataPath = './src/_compiled.json';
    delete require.cache[require.resolve(dataPath)];
    var data = require(dataPath);
    return gulp.src('src/templates/urls/**/*.html')
        .pipe(foreach(function(stream,file){
            return stream
                .pipe(twig({data: data}))
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

gulp.task('default',['less','scripts','data','twig']);

gulp.task('init',['less','scripts','data']);

gulp.task('watch',['twig','browser-sync'],function(){
    gulp.watch("src/less/**/*.less", ['less']);
    gulp.watch("src/scripts/**/*.js", ['scripts']);
    gulp.watch('src/data/*.json',['data']);
    gulp.watch(['src/templates/**/*.html','src/_compiled.json'],['twig']);
    gulp.watch("compiled/**/*.html",['bs-reload']);
});