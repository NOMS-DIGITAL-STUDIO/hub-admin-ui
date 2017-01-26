var gulp = require('gulp');
var mocha = require('gulp-spawn-mocha');

gulp.task('test', function () {
    return gulp.src('test/**/*.js')
        .pipe(mocha({
            reporter: 'list',
            istanbul: {
                dir: 'build/reports/coverage'
            }
        }));
});
