var gulp = require('gulp');
var runSequence = require('run-sequence');

gulp.task('default', function (done) {
    runSequence(
        'build',
        'watch',
        'server', done)
});

gulp.task('build', function (done) {
    runSequence(
        'clean',
        'generate-assets',
        'test', done)
});

gulp.task('generate-assets', function (done) {
    runSequence(
        'copy-govuk-modules',
        'sass',
        'lint-client',
        'copy-assets', done)
});

gulp.task('watch', function (done) {
    runSequence(
        'watch-sass',
        'watch-assets',
        'watch-tests', done)
});




