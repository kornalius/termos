'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var path = require('path');
var fs = require('fs');
var glob = require('glob');
// var browserify = require('browserify');


var DEST_DIR = 'dist/';


// Compile stylesheets
gulp.task('css', function () {
  return gulp.src(['./css/*.css', './components/butterfly/term.css'])
    .pipe($.sourcemaps.init())
    .pipe($.cssmin())
    .pipe($.sourcemaps.write())
    .pipe($.concat('app/index.css'))
    .pipe(gulp.dest(DEST_DIR))
    .pipe($.size({ title: 'css' }));
});


// Copy user files
gulp.task('user', function () {
  return gulp.src('./user/**/*')
    .pipe($.copy(DEST_DIR))
    .pipe($.size({ title: 'user' }));
});


// Copy assets
gulp.task('assets', function () {
  return gulp.src('./assets/**/*')
    .pipe($.copy(DEST_DIR))
    .pipe($.size({ title: 'assets' }));
});


// Copy Fonts
gulp.task('fonts', function () {
  return gulp.src('./fonts/**/*')
    .pipe($.copy(DEST_DIR))
    .pipe($.size({ title: 'fonts' }));
});


// Browserify main coffee files
gulp.task('main', function () {
  return gulp.src('./app/main.coffee', { read: false })
    .pipe($.sourcemaps.init())
    .pipe($.browserify({
      // insertGlobals : true,
      nobuiltins: 'assert buffer child_process cluster console constants crypto dgram dns domain events fs http https module net os path punycode querystring readline repl stream stream_duplex stream_passthrough stream_readable stream_transform stream_writable string_decoder sys timers tls tty url util vm zlib process', transform: ['coffeeify'],
      extensions: ['.coffee'],
      ignore: ['ipc', 'remote'] }))
    .pipe($.sourcemaps.write())
    .pipe($.rename('main.js'))
    .pipe(gulp.dest(DEST_DIR + 'app'))
    .pipe($.size({ title: 'main' }));
});


// Browserify app coffee files
gulp.task('app', function () {
  return gulp.src('./app/app.coffee', { read: false })
    .pipe($.sourcemaps.init())
    .pipe($.browserify({
      // insertGlobals : true,
      nobuiltins: 'process',
      transform: ['coffeeify'],
      extensions: ['.coffee'] }))
    .pipe($.sourcemaps.write())
    .pipe($.rename('app.js'))
    .pipe(gulp.dest(DEST_DIR + 'app'))
    .pipe($.size({ title: 'app' }));
});


// Copy index file
gulp.task('index', function () {
  return gulp.src('./app/index.js')
    .pipe($.copy(DEST_DIR))
    .pipe($.size({ title: 'index' }));
});


// Browserify objects coffee files
gulp.task('objects', function () {
  return gulp.src('./objects/index.coffee', { read: false })
    .pipe($.sourcemaps.init())
    .pipe($.browserify({
      // insertGlobals : true,
      transform: ['coffeeify'],
      extensions: ['.coffee'] }))
    .pipe($.sourcemaps.write())
    .pipe($.rename('index.js'))
    .pipe(gulp.dest(DEST_DIR + 'objects'))
    .pipe($.size({ title: 'objects' }));
});


// Browserify components coffee files
gulp.task('components', function () {
  return gulp.src('./components/index.coffee', { read: false })
    .pipe($.sourcemaps.init())
    .pipe($.browserify({
      // insertGlobals : true,
      transform: ['coffeeify'],
      extensions: ['.coffee'] }))
    .pipe($.sourcemaps.write())
    .pipe($.rename('index.js'))
    .pipe(gulp.dest(DEST_DIR + 'components'))
    .pipe($.size({ title: 'components' }));
});


// Browserify tests coffee files
gulp.task('tests', function () {
  return gulp.src('./tests/index.coffee', { read: false })
    .pipe($.sourcemaps.init())
    .pipe($.browserify({
      // insertGlobals : true,
      transform: ['coffeeify'],
      extensions: ['.coffee'] }))
    .pipe($.sourcemaps.write())
    .pipe($.rename('index.js'))
    .pipe(gulp.dest(DEST_DIR + 'tests'))
    .pipe($.size({ title: 'tests' }));
});


// Copy scripts files
gulp.task('scripts', function () {
  return gulp.src('./scripts/**/*')
    .pipe($.copy(DEST_DIR))
    .pipe($.size({ title: 'scripts' }));
});


// Clean Output Directory
gulp.task('clean', del.bind(null, [DEST_DIR]));


// Build Files
gulp.task('build', ['clean'], function (cb) {
  runSequence(
    ['css', 'main', 'app', 'index'],
    ['tests', 'objects', 'components'],
    ['scripts', 'user', 'assets', 'fonts'],
    cb);
});


// Watch Files For Changes & Reload
gulp.task('serve', function () {
  gulp.watch(['app/**/*.coffee', 'app/**/*.js'], ['app', 'build']);
  gulp.watch(['app/objects/**/*.coffee'], ['objects', 'build']);
  gulp.watch(['app/components/**/*.coffee'], ['components', 'build']);
  gulp.watch(['app/tests/**/*.coffee'], ['tests', 'build']);

  gulp.watch(['app/**/*.css', 'css/**/*.css', 'user/**/*.css'], ['styles', 'build']);

  gulp.watch(['app/scripts/**/*.js'], ['scripts', 'build']);

  gulp.watch(['app/assets/**/*'], ['assets', 'build']);

  gulp.watch(['app/fonts/**/*'], ['fonts', 'build']);
});


// GSKED Sublime Text fix
gulp.task('default', ['clean'], function (cb) {
  runSequence(['serve', 'build'], cb);
});
