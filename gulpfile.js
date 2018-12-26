const gulp = require('gulp');
const del = require('del');
const gulpShell = require('gulp-shell');
// const runSequence = require('run-sequence');
const gulpSequence = require('gulp-sequence');
const nodemon = require('nodemon');


gulp.task('del', () => {
    del(['./bin', './dist'])
});

gulp.task('shell', gulpShell.task('tsc'));

gulp.task('favicon', () => {
    return gulp.src(['src/public/favicon.ico'], { base: 'src/public' })
        .pipe(gulp.dest('dist'))
})

gulp.task('hbs', () => {
    return gulp.src(['src/views/**/*.html'], { base: 'src/views' })
        .pipe(gulp.dest('bin/views'))
})

gulp.task('nodemon', () => {
    return nodemon({
        script: 'bin/app.js'
    })
})

gulp.task('watch', () => {
    gulp.watch('src/**/*.ts', ['shell']);
    gulp.watch('src/views/**/*.html', ['hbs']);
})

gulp.task('dev', gulpSequence('del', 'favicon', 'shell', 'hbs', 'nodemon', 'watch'))