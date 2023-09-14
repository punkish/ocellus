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

    const dest = [
        `${destination}/js/0/ocellus-*.js`, 
        `${destination}/css/0/ocellus-*.css`
    ];

    const opts = { read: false };

    return src(dest, opts).pipe( rm() );
}

// generate the html
async function html() {
    console.log('writing html');
    
    return src(`${source}/index0.html`)
        .pipe(inject.replace('%date%', d))
        .pipe(inject.replace('%dsecs%', dsecs))
        .pipe(inject.replace('./js/0/ocellus.js', `./js/0/ocellus-${dsecs}.js`))
        .pipe(htmlReplace({
            'css': `./css/0/ocellus-${dsecs}.css`
        }))
        .pipe(dest(destination))
}

// for css
async function css() {
    console.log('processing css');

    return src([
            `${source}/css/0/i-base.css`,
            `${source}/css/0/i-header.css`,
            `${source}/css/0/i-form.css`,
            `${source}/css/0/i-grid.css`,
            `${source}/css/0/i-throbber.css`,
            `${source}/css/0/i-pager.css`,
            `${source}/css/0/i-map.css`,
            `${source}/css/0/i-treatmentDetails.css`,
            `${source}/css/0/i-media-queries.css`
        ])
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(concat(`ocellus-${dsecs}.css`))
        .pipe(dest(`${destination}/css/0`))
}

// rollup js
async function js() {
    console.log('rolling up the js');
    
    const bundle = await rollup({
        input: `${source}/js/0/ocellus.js`
    });

    return bundle.write({
        file: `${destination}/js/0/ocellus-${dsecs}.js`,
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

/************ for index2 */ 

// remove old css and js
async function cleanup2() {
    console.log('cleaing up old files for new index');

    const dest = [
        `${destination}/js/ocellus-*.js`, 
        `${destination}/css/ocellus-*.css`
    ];

    const opts = { read: false };

    return src(dest, opts).pipe( rm() );
}

// generate the html
async function html2() {
    console.log('writing html for new index');
    
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
async function css2() {
    console.log('processing css for new index');

    return src([
            `${source}/css/base.css`,
            `${source}/css/header.css`,
            `${source}/css/form.css`,
            `${source}/css/charts.css`,
            `${source}/css/examples.css`,
            `${source}/css/quicksearch.css`,
            `${source}/css/toggleSwitch.css`,
            `${source}/css/grid.css`,
            `${source}/css/throbber.css`,
            `${source}/css/pager.css`,
            `${source}/css/map.css`,
            `${source}/css/treatmentDetails.css`,
            `${source}/css/media-queries.css`,
            `${source}/libs/fancySearch/fancySearch.css`
        ])
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(concat(`ocellus-${dsecs}.css`))
        .pipe(dest(`${destination}/css`))
}

// rollup js
async function js2() {
    console.log('rolling up the js for new index');
    
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

const one = series(cleanup, parallel(css, js, html));
const two = series(cleanup2, parallel(css2, js2, html2))
exports.default = parallel(one, two);