const { series, parallel, src, dest } = require('gulp');
const htmlreplace = require('gulp-html-replace');
const inject = require('gulp-inject-string');
const cssmin = require('gulp-cssmin');
const concat = require('gulp-concat');
const { rollup } = require('rollup');
const { terser } = require('rollup-plugin-terser');

function html() {
    console.log('writing html');
    return src('dev/index.html')
        .pipe(inject.replace('%date%', Date()))
        .pipe(htmlreplace({
            'css': '/css/ocellus.min.css'
        }))
        .pipe(dest('.'))
}

// for css
function css() {
    console.log('processing css');
    return src([
            'dev/css/i-base.css',
            'dev/css/i-header.css',
            'dev/css/i-form.css',
            'dev/css/i-grid.css',
            'dev/css/i-throbber.css',
            'dev/css/i-pager.css',
            'dev/css/i-map.css',
            'dev/css/i-treatmentDetails.css',
            'dev/css/i-media-queries.css',
        ])
        .pipe(cssmin())
        .pipe(concat('ocellus.min.css'))
        .pipe(dest('./css'))
}

async function build() {
    const bundle = await rollup({
        input: 'dev/js/ocellus.js'
    });

    return bundle.write({
        file: 'js/ocellus.js',
        format: "esm",
        plugins: [terser()],
    });
}

exports.default = series(build, parallel(css, html));