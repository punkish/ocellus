const { series, parallel, src, dest } = require('gulp');
const htmlreplace = require('gulp-html-replace');
const inject = require('gulp-inject-string');
const cssmin = require('gulp-cssmin');
const concat = require('gulp-concat');
const { rollup } = require('rollup');
const { terser } = require('rollup-plugin-terser');
const rm = require('gulp-rm');

const d = new Date();
const dsecs = d.getTime();

async function cleanup() {
    console.log('cleaing up old files');
    return src(['js/ocellus-*.js', 'css/ocellus-*.css'], { read: false })
        .pipe( rm() )
}

function html() {
    console.log('writing html');
    return src('dev/index.html')
        .pipe(inject.replace('%date%', d))
        .pipe(inject.replace('%dsecs%', dsecs))
        .pipe(inject.replace('./js/ocellus.js', `./js/ocellus-${dsecs}.js`))
        .pipe(htmlreplace({
            'css': `/css/ocellus-${dsecs}.css`
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
        .pipe(concat(`ocellus-${dsecs}.css`))
        .pipe(dest('./css'))
}

async function build() {
    const bundle = await rollup({
        input: 'dev/js/ocellus.js'
    });

    return bundle.write({
        file: `js/ocellus-${dsecs}.js`,
        format: "esm",
        plugins: [
            terser({
                format: {
                    preamble: `/* generated: ${d} */`
                }
            })
        ]
    });
}

exports.default = series(cleanup, build, parallel(css, html));