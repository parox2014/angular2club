/**
 * fileName:gulp配置文件
 * CreatedBy: William
 * date: 2015/2/28
 */
'use strict';

var gulp   = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var ngHtml2Js = require('gulp-ng-html2js');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var cssmin = require('gulp-cssmin');
var autoprefixer = require('gulp-autoprefixer');
var ngAnnotate = require('gulp-ng-annotate');

var debug = true;
//合并angular
gulp.task('ngConcat',function() {
   return gulp
       .src([
           './lib/angular/angular.min.js',
           './lib/angular/angular-animate.min.js',
           './lib/angular/angular-aria.min.js',
           './lib/angular/angular-resource.min.js',
           './lib/angular/angular-sanitize.min.js',
           './lib/angular/angular-touch.min.js',
           './lib/angular/angular-messages.min.js',
           './lib/angular/angular-translate.min.js',
           './lib/angular/angular-ui-router.min.js'
        ])
       .pipe(concat('angular.bundle.min.js'))
       .pipe(gulp.dest('./lib/angular/'));
});


//为ng模块自动添加依赖并压缩
gulp.task('ngAnnotate', function () {
    return gulp.src([ './js/**/*.js','!./js/lib/**/*.js','!.js/**/*.min.js','!./js/test/*.js' ])
        .pipe(ngAnnotate())
        .pipe(uglify({
            mangle:{
                except:[ 'require','module','exports' ]
            },
            preserveComments:false
        }))
        .pipe(gulp.dest('dist'));
});

//js语法检查
gulp.task('hint', function() {
    return gulp.src('js/**/*.js')
        .pipe(jshint());
});


//压缩库
gulp.task('compressLib',function() {
    return gulp.src([ './js/lib/**/*.js' ])
        .pipe(uglify({
            mangle:{
                except:[ 'require','module','exports' ]
            },
            preserveComments:false
        }))
        .pipe(gulp.dest('./dist/lib'));

});


//编译合并html模板
gulp.task('template',function() {
    gulp.src("./templates/**/*.html")
        .pipe(ngHtml2Js({
            moduleName: "app.templates",
            prefix:'../templates/'
        }))
        .pipe(concat('template.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest("./js/"));
});


//编译sass文件为css
gulp.task('sass',function() {
    gulp.src([ './scss/**/*.scss' ])
        .pipe(sass())
        .pipe(autoprefixer({
            browsers:[ 'last 10 versions' ]
        }))
        .pipe(cssmin())
        .pipe(gulp.dest('./css/'));
});



//监视sass文件变更，自动编译
gulp.task('watch',function() {
   gulp.watch('./scss/**/*.scss',[ 'sass' ]);
});

//应用发布
gulp.task('publish',[ 'ngAnnotate','sass','template' ]);

//合并js文件
gulp.task('build',function () {
    gulp.src('./js/**/*.js')
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest('./dist/'));
});
gulp.task('default',[ 'hint' ]);
