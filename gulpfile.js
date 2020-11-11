const { parallel, src, dest } = require('gulp');

const htmlreplace = require('gulp-html-replace');
const inject = require('gulp-inject-string');
// const cssmin = require('gulp-cssmin');
// const concat = require('gulp-concat');
// const terser = require('gulp-terser');
const useref = require('gulp-useref');

// const htmldest = '.';
// const cssdest = htmldest + '/css';
// const jsdest = htmldest + '/js';

// const finalcss = 'ocellus-bundle.css';
// const finaljs = 'ocellus-bundle.min.js';

// for index.html
async function i() {
    return await src('dev/index.html')
        .pipe(inject.replace('%date%', Date()))
        .pipe(useref())
        .pipe(dest('.'));
}

// for 4t.html
async function t() {
    return await src('dev/4t.html')
        .pipe(inject.replace('%date%', Date()))
        .pipe(useref())
        .pipe(dest('.'));
}

// function docss() {
//     return src([
//             'libs/JavaScript-autoComplete/auto-complete.css',
//             'dev/css/uglyduck.css',
//             'dev/css/o4-base.css',
//             'dev/css/o4-form.css',
//             'dev/css/o4-images.css',
//             'dev/css/o4-treatments.css',
//             'dev/css/o4-citations.css',
//             'dev/css/o4-media-queries.css'
//         ])
//         // .pipe(cssmin())
//         .pipe(concat(finalcss))
//         .pipe(dest(cssdest));
// }

// function dohtml() {
//     return src('dev/index.html')
//         .pipe(inject.replace('%date%', Date()))
//         .pipe(htmlreplace({
//             'css': `css/${finalcss}`,
//             'js': `js/${finaljs}`
//         }))
//         .pipe(dest(htmldest));
// }

// function dojs(){
//     return src([
//             'libs/lazysizes.min.js', 
//             'libs/mustache.min.js', 
//             'libs/JavaScript-autoComplete/auto-complete.min.js',
//             'dev/js/o4-base.js',
//             'dev/js/o4-utils.js'
//         ])
//         .pipe(terser())
//         .pipe(concat(finaljs))
//         .pipe(dest(jsdest));
// }

//exports.default = parallel(docss, dohtml, dojs);
exports.default = parallel(i, t);