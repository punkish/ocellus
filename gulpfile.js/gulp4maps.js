const { series, parallel, src, dest } = require('gulp');
const htmlReplace = require('gulp-html-replace');
const inject = require('gulp-inject-string');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const { rollup } = require('rollup');
const { terser } = require('rollup-plugin-terser');
const rm = require('gulp-rm');
const wrap = require('gulp-wrap');

const d = new Date();
const dsecs = d.getTime();
const source = '.';
const destination = './docs';

const sep1 = '/*************************/';
const sep2 = '/*** <%= file.relative %>  ***/';

// remove old css and js
async function cleanup() {
    console.log('cleaing up old js and css for maps');

    const dest = [
        `${destination}/js/ocellus-maps-*.js`, 
        `${destination}/css/ocellus-maps-*.css`
    ];

    const opts = { read: false };

    return src(dest, opts).pipe( rm() );
}

// generate the html
async function html() {
    console.log('writing html for new maps');
    
    return src(`${source}/maps.html`)
        .pipe(inject.replace('%date%', d))
        .pipe(inject.replace('%dsecs%', dsecs))
        .pipe(inject.replace(
            './js/ocellus-maps.js', 
            `./js/ocellus-maps-${dsecs}.js`
        ))
        .pipe(htmlReplace({
            'css': `./css/ocellus-maps-${dsecs}.css`,
            'csslibs': `./css/libs-maps-combined.css`,
            'jslibs': `./js/libs-maps-combined.js`
        }))
        .pipe(dest(destination))
}

// for css
async function css() {
    console.log('processing css for new maps');

    return src([
            `${source}/css/uglyduck.css`,
            `${source}/css/base.css`,
            `${source}/css/header.css`,
            `${source}/css/toggles.css`,
            `${source}/css/grid.css`,
            `${source}/css/throbber.css`,
            `${source}/css/map.css`,
            `${source}/css/media-queries.css`
        ])
        // .pipe(sourcemaps.init())
        // .pipe(cleanCSS({compatibility: 'ie8'}))
        // .pipe(sourcemaps.write('.'))

        // https://stackoverflow.com/a/23177650/183692
        // add file name as a comment before its content
        .pipe(wrap(`${sep2}\n<%= contents %>`))
        .pipe(concat(`ocellus-maps-${dsecs}.css`))
        .pipe(dest(`${destination}/css`))
}

async function cssLibs() {
    console.log('processing css libs for new maps');

    return src([
            `${source}/libs/leaflet-markercluster/MarkerCluster.css`,
            `${source}/libs/leaflet-markercluster/MarkerCluster.Default.css`,
            `${source}/libs/leaflet-slidebar/src/leaflet.slidebar.css`
        ])
        .pipe(cleanCSS({compatibility: 'ie8'}))

        // https://stackoverflow.com/a/23177650/183692
        // add file name as a comment before its content
        .pipe(wrap(`${sep1}\n${sep2}\n<%= contents %>`))
        .pipe(concat(`libs-maps-combined.css`))
        .pipe(dest(`${destination}/css`))
}

// rollup js
async function js() {
    console.log('rolling up the JS for new maps');
    
    const bundle = await rollup({
        input: `${source}/js/ocellus-maps.js`
    });

    return bundle.write({
        file: `${destination}/js/ocellus-maps-${dsecs}.js`,
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

async function jsLibs() {
    console.log('concatenating without minifying JS libs');

    return src([
        `${source}/libs/picolog/picolog.min.js`,
        `${source}/libs/lazysizes.min.js`
    ])

    // https://stackoverflow.com/a/23177650/183692
    // add file name as a comment before its content
    .pipe(wrap(`${sep1}\n${sep2}\n<%= contents %>`))
    .pipe(concat(`libs-maps-combined.js`))
    .pipe(dest(`${destination}/js`))
}

const gulp4maps = parallel(css, cssLibs, js, jsLibs, html);

exports.gulp4maps = gulp4maps;