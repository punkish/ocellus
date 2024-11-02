const { series, parallel, src, dest } = require('gulp');
const htmlReplace = require('gulp-html-replace');
const inject = require('gulp-inject-string');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const { rollup } = require('rollup');
const { terser } = require('rollup-plugin-terser');
const replace = require('@rollup/plugin-replace');
const rm = require('gulp-rm');
const wrap = require('gulp-wrap');

const d = new Date();
const dsecs = d.getTime();
const source = '.';
const destination = './docs';
const sep = '/*** <%= file.relative %>  ***/';

// remove old css and js
async function cleanup() {
    console.log('cleaing up old js and css for index');

    const dest = [
        `${destination}/js/ocellus-*.js`, 
        `${destination}/css/ocellus-*.css`
    ];

    const opts = { read: false };

    return src(dest, opts).pipe( rm() );
}

// generate the html
async function html() {
    console.log('writing html for new index');
    
    return src(`${source}/index.html`)
        .pipe(inject.replace('%date%', d))
        .pipe(inject.replace('%dsecs%', dsecs))
        .pipe(inject.replace('./js/ocellus.js', `./js/ocellus-${dsecs}.js`))
        .pipe(htmlReplace({
            'leafletcss': 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css',
            'leafletjs':'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js',
            'csslibs': './css/libs-combined.css',
            'css': `./css/ocellus-${dsecs}.css`,
            'jslibs': './js/libs-combined.js'
        }))
        //.pipe(cleanhtml())
        .pipe(dest(destination))
}

// for css
async function css() {
    console.log('processing css for new index');

    return src([
            `${source}/css/uglyduck.css`,
            `${source}/css/base.css`,
            `${source}/css/header.css`,
            `${source}/css/form.css`,
            `${source}/css/adv-search.css`,
            `${source}/css/examples.css`,
            `${source}/css/quicksearch.css`,
            `${source}/css/toggles.css`,
            `${source}/css/grid.css`,
            `${source}/css/carousel.css`,
            `${source}/css/charts.css`,
            `${source}/css/throbber.css`,
            `${source}/css/pager.css`,
            `${source}/css/map.css`,
            `${source}/css/close-btn.css`,
            `${source}/css/treatmentDetails.css`,
            `${source}/css/sparkline.css`,
            `${source}/css/simpleLightbox.css`,
            `${source}/css/simpleLightbox-modifiers.css`,
            `${source}/css/media-queries.css`
        ])
        .pipe(cleanCSS({compatibility: 'ie8'}))

        // https://stackoverflow.com/a/23177650/183692
        // add file name as a comment before its content
        .pipe(wrap(`${sep}\n<%= contents %>`))
        .pipe(concat(`ocellus-${dsecs}.css`))
        .pipe(dest(`${destination}/css`))
}

async function cssLibs() {
    console.log('processing css libs for new index');

    return src([
        `${source}/node_modules/leaflet/dist/leaflet.css`,
        `${source}/libs/JavaScript-autoComplete/auto-complete.css`,
        `${source}/libs/pop-pop/pop-pop.min.css`,
        `${source}/node_modules/leaflet-draw/dist/leaflet.draw.css`,
        `${source}/libs/leaflet-slidebar/src/leaflet.slidebar.css`,
        `${source}/node_modules/leaflet-draw/dist/leaflet.draw.css`,
        `${source}/node_modules/leaflet.markercluster/dist/MarkerCluster.css`,
        `${source}/node_modules/leaflet.markercluster/dist/MarkerCluster.Default.css`,
        `${source}/node_modules/leaflet-easybutton/src/easy-button.css`,
    ])
    .pipe(cleanCSS({compatibility: 'ie8'}))

    // https://stackoverflow.com/a/23177650/183692
    // add file name as a comment before its content
    .pipe(wrap(`${sep}\n<%= contents %>`))
    .pipe(concat(`libs-combined.css`))
    .pipe(dest(`${destination}/css`))
}

// rollup js
async function js() {
    console.log('rolling up the JS for new index');
    
    const bundle = await rollup({
        input: `${source}/js/ocellus.js`
    });

    const values = {
        'log.INFO':'log.ERROR',
        'http://localhost:3010/v3':'https://test.zenodeo.org/v3',
        'http://localhost:3000':'https://maps.zenodeo.org',
        //__buildDate__: () => JSON.stringify(new Date()),
        //__buildVersion: 15
    }

    return bundle.write({
        file: `${destination}/js/ocellus-${dsecs}.js`,
        format: "esm",
        plugins: [
            replace({ values }),
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
        `${source}/libs/simple-lightbox/simpleLightbox.js`,
        `${source}/libs/picolog/picolog.min.js`,
        `${source}/libs/lazysizes.min.js`,
        `${source}/libs/JavaScript-autoComplete/auto-complete.js`,
        `${source}/libs/echarts/echarts.min.js`,
        `${source}/node_modules/leaflet-draw/dist/leaflet.draw.js`,
        `${source}/node_modules/leaflet-easybutton/src/easy-button.js`,
        `${source}/node_modules/leaflet-draw/dist/leaflet.draw.js`,
        `${source}/node_modules/leaflet.markercluster/dist/leaflet.markercluster.js`,
        `${source}/node_modules/leaflet.vectorgrid/dist/Leaflet.VectorGrid.bundled.js`
    ])

    // https://stackoverflow.com/a/23177650/183692
    // add file name as a comment before its content
    .pipe(wrap(`${sep}\n<%= contents %>`))
    .pipe(concat(`libs-combined.js`))
    .pipe(dest(`${destination}/js`))
}

const gulp4index = series(
    cleanup, 
    parallel(css, cssLibs, js, jsLibs, html)
);

exports.gulp4index = gulp4index;