const gulp = require('gulp');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const typescript = require('gulp-typescript');

const tsProject = typescript.createProject('tsconfig.json');

gulp.task('default', () => {
    return tsProject.src()
        .pipe(tsProject())
        .js
        .pipe(uglify())
        .pipe(rename('autorouter.min.js'))
        .pipe(gulp.dest('dist'))
});

gulp.task('tests', () => {
    return gulp.src('./src/**/*.ts')
        .pipe(tsProject())
        .js
        .pipe(gulp.dest('dist'))
});

gulp.task('watch', ['default'], () => {
    gulp.watch('./src/autorouter.ts', ['default']);
});
