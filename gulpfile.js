const { parallel, src, dest } = require('gulp');

const htmlreplace = require('gulp-html-replace');
const inject = require('gulp-inject-string');
const cssmin = require('gulp-cssmin');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const useref = require('gulp-useref');

const root = '.'
const ns = {
    t: {
        dest: {
            html: root,
            css: `${root}/css`,
            js: `${root}/js`
        },
        files: {
            css: 'o4t.min.css',
            js: 'o4t.min.js',
            html: '4t.html'
        }
    },

    i: {
        dest: {
            html: root,
            css: `${root}/css`,
            js: `${root}/js`
        },
        files: {
            css: 'o4.min.css',
            js: 'o4.min.js',
            html: 'index.html'
        }
    },

    m: {
        dest: {
            html: root,
            css: `${root}/css`,
            js: `${root}/js`
        },
        files: {
            css: 'o4m.min.css',
            js: 'o4m.min.js',
            html: 'map.html'
        }
    },
}

// for index.html
async function i() {
    return await src('dev/index.html')
        .pipe(inject.replace('%date%', Date()))
        .pipe(useref())
        .pipe(dest('.'));
}

// for map.html
function m_css() {
    return src([
            'dev/css/uglyduck.css',
            'dev/css/o4t-base.css',
            'dev/css/o4t-header.css',
            'dev/css/o4t-form.css',
            'dev/css/o4t-throbber.css',
            'dev/css/o4t-grid.css',
            'dev/css/o4t-pager.css',
            'dev/css/o4t-treatmentDetails.css',
            'dev/css/o4t-media-queries.css',
            'dev/css/o4-map.css',
        ])
        .pipe(cssmin())
        .pipe(concat(ns.m.files.css))
        .pipe(dest(ns.m.dest.css))
}

function m_js() {
    return src([
            'dev/js/o4-globals.js',
            'dev/js/o4-map.js'
        ])
        .pipe(terser())
        .pipe(concat(ns.m.files.js))
        .pipe(dest(ns.m.dest.js))
}

function m_html() {
    return src('dev/map.html')
        .pipe(inject.replace('%date%', Date()))
        .pipe(htmlreplace({
            'css': `css/${ns.m.files.css}`,
            'js': `js/${ns.m.files.js}`
        }))
        .pipe(dest(ns.m.dest.html))
}

// for 4t.html
function t_css() {
    return src([
            'dev/css/uglyduck.css',
            'dev/css/o4t-base.css',
            'dev/css/o4t-header.css',
            'dev/css/o4t-form.css',
            'dev/css/o4t-throbber.css',
            'dev/css/o4t-grid.css',
            'dev/css/o4t-pager.css',
            'dev/css/o4t-treatmentDetails.css',
            'dev/css/o4t-media-queries.css'
        ])
        .pipe(cssmin())
        .pipe(concat(ns.t.files.css))
        .pipe(dest(ns.t.dest.css))
}

function t_js() {
    return src([
            'dev/js/o4-globals.js',
            'dev/js/o4t-ng.js',
            'dev/js/o4t-pager.js'
        ])
        .pipe(terser())
        .pipe(concat(ns.t.files.js))
        .pipe(dest(ns.t.dest.js))
}

function t_html() {
    return src('dev/4t.html')
        .pipe(inject.replace('%date%', Date()))
        .pipe(htmlreplace({
            'css': `css/${ns.t.files.css}`,
            'js': `js/${ns.t.files.js}`
        }))
        .pipe(dest(ns.t.dest.html))
}



function i_css() {
    return src([
            'libs/JavaScript-autoComplete/auto-complete.css',
            'dev/css/uglyduck.css',
            'dev/css/o4-base.css',
            'dev/css/o4-form.css',
            'dev/css/o4-images.css',
            'dev/css/o4-treatments.css',
            'dev/css/o4-citations.css',
            'dev/css/o4-media-queries.css'
        ])
        .pipe(cssmin())
        .pipe(concat(ns.i.files.css))
        .pipe(dest(ns.i.dest.css))
}

function i_js(){
    return src([
            'libs/lazysizes.min.js', 
            'libs/mustache.min.js', 
            'libs/JavaScript-autoComplete/auto-complete.min.js',
            'dev/js/o4-globals.js',
            'dev/js/o4-base.js',
            'dev/js/o4-utils.js'
        ])
        .pipe(terser())
        .pipe(concat(ns.i.files.js))
        .pipe(dest(ns.i.dest.js))
}

function i_html() {
    return src('dev/index.html')
        .pipe(inject.replace('%date%', Date()))
        .pipe(htmlreplace({
            'css': `css/${ns.i.files.css}`,
            'js': `js/${ns.i.files.js}`
        }))
        .pipe(dest(ns.i.dest.html))
}

exports.default = parallel(m_css, m_html, m_js, t_css, t_html, t_js, i_css, i_html, i_js);