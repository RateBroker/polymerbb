const gulp = require('gulp');
const babel = require('gulp-babel');

var babelProcess = babel({ presets: ['es2015'] });

gulp.task('elements', [], function () {
    return gulp.src(['src/*.js'])
            .pipe(babelProcess)
            .pipe(gulp.dest('dist'));
});

gulp.task('default', ['elements'], function () {});