const gulp = require('gulp');
const babel = require('gulp-babel');
const merge = require('merge-stream');
const runSequence = require('run-sequence');

var babelProcess = babel({ presets: ['es2015'] });

gulp.task('elements', function () {

  let elementsJs = gulp.src(['src/*.js'])
    .pipe(babelProcess)
    .pipe(gulp.dest('dist'));

  let elementsHtml = gulp.src(['src/*.html'])
          .pipe(gulp.dest('dist'));

  return merge(elementsJs, elementsHtml);
});

gulp.task('copy-root', [], function () {
    return gulp.src(['dist/*.{html,js}'])
            .pipe(gulp.dest('./'));
});

gulp.task('default', function (cb) {
  runSequence(
    'elements',
    'copy-root',
    cb
  );
});
