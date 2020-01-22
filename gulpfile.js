const { parallel, src, dest } = require('gulp');

const htmlreplace = require('gulp-html-replace');
const cssmin = require('gulp-cssmin');
const concat = require('gulp-concat');
const terser = require('gulp-terser');

const htmldest = '.';
const cssdest = htmldest + '/css';
const jsdest = htmldest + '/js';

const finalcss = 'ocellus-bundle.min.css';
const finaljs = 'ocellus-bundle.min.js';

function docss() {
    return src([
            // 'libs/Barebones-3.0.1/css/normalize.css', 
            // 'libs/Barebones-3.0.1/css/barebones.css',
            'libs/JavaScript-autoComplete/auto-complete.css',
            'dev/css/o4-*.css'
        ])
        .pipe(cssmin())
        .pipe(concat(finalcss))
        .pipe(dest(cssdest));
}

function dohtml() {
    return src('dev/index.html')
        .pipe(htmlreplace({
            'css': `css/${finalcss}`,
            'js': `js/${finaljs}`
        }))
        .pipe(dest(htmldest));
}

function dojs(){
    return src([
            'libs/lazysizes.min.js', 
            'libs/mustache.min.js', 
            'libs/JavaScript-autoComplete/auto-complete.min.js',
            'dev/js/o4-*.js'
        ])
        .pipe(terser())
        .pipe(concat(finaljs))
        .pipe(dest(jsdest));
}

exports.default = parallel(docss, dohtml, dojs);