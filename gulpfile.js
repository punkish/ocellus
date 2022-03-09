const { series, parallel, src, dest } = require('gulp');
const htmlreplace = require('gulp-html-replace');
const inject = require('gulp-inject-string');
const cssmin = require('gulp-cssmin');
const concat = require('gulp-concat');
const { rollup } = require('rollup');
const { terser } = require('rollup-plugin-terser');
const rm = require('gulp-rm');

// https://stackoverflow.com/questions/36188219/add-commit-and-push-at-once-using-gulp-git
const argv = require('yargs').argv;
const git = require('gulp-git');

const d = new Date();
const dsecs = d.getTime();
const runForReal = true;

// remove old css and js
async function cleanup() {
    console.log('cleaing up old files');
    if (runForReal) {
        return src([
                'js/ocellus-*.js', 
                'css/ocellus-*.css'
            ], 
            { read: false })
            .pipe( rm() );
    }
}

// generate the html
async function html() {
    console.log('writing html');
    if (runForReal) {
        return src('dev/index.html')
            .pipe(inject.replace('%date%', d))
            .pipe(inject.replace('%dsecs%', dsecs))
            .pipe(inject.replace('./js/ocellus.js', `./js/ocellus-${dsecs}.js`))
            .pipe(htmlreplace({
                'css': `/css/ocellus-${dsecs}.css`
            }))
            .pipe(dest('.'))
    }
}

// for css
async function css() {
    console.log('processing css');
    if (runForReal) {
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
}

// rollup js
async function js() {
    console.log('rolling up the js');
    if (runForReal) {
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
}

async function gitadd () {
    console.log('git – adding changed files');
    if (runForReal) {
        return src('.')
            .pipe(git.add());
    }
}

async function gitcommit () {
    console.log(`git – commiting "${argv.m}"`);
    if (runForReal) {
        return src('.')
            .pipe(git.commit(argv.m));
    }
};

async function gitpush (){
    console.log('git – pushing to remote');
    if (runForReal) {
        git.push('origin', 'master', function (err) {
            if (err) throw err;
        });
    }
};

// exports.default = series(cleanup, js, parallel(css, html));

exports.default = series(cleanup, parallel(css, js, html));