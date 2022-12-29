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
        `${destination}/js/ocellus-*.js`, 
        `${destination}/css/ocellus-*.css`
    ];

    const opts = { read: false };

    return src(dest, opts).pipe( rm() );
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

/************ for index2 */ 

// remove old css and js
async function cleanup2() {
    console.log('cleaing up old files for index2');

    const dest = [
        `${destination}/js/2/ocellus-*.js`, 
        `${destination}/css/2/ocellus-*.css`
    ];

    const opts = { read: false };

    return src(dest, opts).pipe( rm() );
}

// generate the html
async function html2() {
    console.log('writing html for index2');
    
    return src(`${source}/index2.html`)
        .pipe(inject.replace('%date%', d))
        .pipe(inject.replace('%dsecs%', dsecs))
        .pipe(inject.replace('./js/2/ocellus.js', `./js/2/ocellus-${dsecs}.js`))
        .pipe(htmlReplace({
            'css': `./css/2/ocellus-${dsecs}.css`
        }))
        .pipe(dest(destination))
}

// for css
async function css2() {
    console.log('processing css for index2');

    return src([
            `${source}/css/2/base.css`,
            `${source}/css/2/header.css`,
            `${source}/css/2/form.css`,
            `${source}/css/2/tristate-toggle.css`,
            `${source}/css/2/examples.css`,
            `${source}/css/2/quicksearch.css`,
            `${source}/css/2/searchSwitcher.css`,
            `${source}/css/2/grid.css`,
            `${source}/css/2/throbber.css`,
            `${source}/css/2/pager.css`,
            `${source}/css/2/map.css`,
            `${source}/css/2/treatmentDetails.css`,
            `${source}/css/2/media-queries.css`,
            `${source}/libs/fancySearch/fancySearch.css`,
            
        ])
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(concat(`ocellus-${dsecs}.css`))
        .pipe(dest(`${destination}/css/2`))
}

// rollup js
async function js2() {
    console.log('rolling up the js for index2');
    
    const bundle = await rollup({
        input: `${source}/js/2/ocellus.js`
    });

    return bundle.write({
        file: `${destination}/js/2/ocellus-${dsecs}.js`,
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