const { series, parallel, src, dest } = require('gulp');
const htmlReplace = require('gulp-html-replace');
const inject = require('gulp-inject-string');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const { rollup } = require('rollup');
const { terser } = require('rollup-plugin-terser');
const rm = require('gulp-rm');

const d = new Date();
const dsecs = d.getTime();
const source = '.';
const destination = './docs';

// remove old css and js
async function cleanup() {
    console.log('cleaing up old files');

    return src([
            `${destination}/js/ocellus-*.js`, 
            `${destination}/css/ocellus-*.css`
        ], 
        { read: false })
        .pipe( rm() );
}

// generate the html
async function html() {
    console.log('writing html');
    
    return src(`${source}/index.html`)
        .pipe(inject.replace('%date%', d))
        .pipe(inject.replace('%dsecs%', dsecs))
        .pipe(inject.replace('./js/ocellus.js', `./js/ocellus-${dsecs}.js`))
        .pipe(htmlReplace({
            'css': `./css/ocellus-${dsecs}.css`
        }))
        .pipe(dest(destination))
}

// for css
async function css() {
    console.log('processing css');

    return src([
            `${source}/css/i-base.css`,
            `${source}/css/i-header.css`,
            `${source}/css/i-form.css`,
            `${source}/css/i-grid.css`,
            `${source}/css/i-throbber.css`,
            `${source}/css/i-pager.css`,
            `${source}/css/i-map.css`,
            `${source}/css/i-treatmentDetails.css`,
            `${source}/css/i-media-queries.css`
        ])
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(concat(`ocellus-${dsecs}.css`))
        .pipe(dest(`${destination}/css`))
}

// rollup js
async function js() {
    console.log('rolling up the js');
    
    const bundle = await rollup({
        input: `${source}/js/ocellus.js`
    });

    return bundle.write({
        file: `${destination}/js/ocellus-${dsecs}.js`,
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

exports.default = series(cleanup, parallel(css, js, html));