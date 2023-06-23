let del = require('del');
let gulp = require('gulp');
let sass = require('gulp-sass')(require('sass'));
let rename = require('gulp-rename');
let cleancss = require('gulp-clean-css');
let webpack = require('webpack-stream');
let named = require('vinyl-named');

let paths = {
    styles: {
        src: 'resources/sass/*.scss',
        dest: 'public/css/'
    },
    scripts: {
        src: 'resources/js/*.js',
        dest: 'public/js/'
    }
};

function clean() {
    return del([paths.styles.dest, paths.scripts.dest]);
}

function styles() {
    return gulp.src(paths.styles.src)
        .pipe(sass({ includePaths: ['node_modules'], outputStyle: 'compressed' }))
        .pipe(cleancss({ level: { 1: { specialComments: 0 } } }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.styles.dest));
}

function scripts() {
    return gulp.src(paths.scripts.src)
        .pipe(named())
        .pipe(webpack())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.scripts.dest));
}

let build = gulp.series(clean, gulp.parallel(styles, scripts));

exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.build = build;

exports.default = build;