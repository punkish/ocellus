module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {

            options: {
                mangle: false
            },

            // 7. minify ocellus.js -> ocellus.min.js
            ocellusJs: {
                src: ['js/o3.js'],
                dest: 'js/o3.min.js'
            }
        },
        
        cssmin: {

            options: {
                mergeIntoShorthands: false,
                roundingPrecision: -1
            },

            // 2. minify o3.css -> o3.min.css
            ocellusCss: {
                src: ['css/o3.css'],
                dest: 'css/o3.min.css'
            },

            // 3. minify barebones.css -> barebones.min.css
            barebonesCss: {
                src: [
                    'Barebones-3.0.1/css/normalize.css', 
                    'Barebones-3.0.1/css/barebones.css'
                ],
                dest: 'css/barebones.min.css'
            },

            // 4. minify autocomplete.css -> autocomplete.min.css
            autocompleteCss: {
                src: ['JavaScript-autoComplete/auto-complete.css'],
                dest: 'css/auto-complete.min.css'
            },

            // 4a. minify vanilla-js-tabs.css -> vanilla-js-tabs.min.css
            vanillaTabsCss: {
                src: ['vanilla-js-tabs-master/dist/vanilla-js-tabs.css'],
                dest: 'css/vanilla-js-tabs.min.css'
            }
        },
        
        concat: {

            options : {
                sourceMap :true,
                banner: '/*! <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },

            // 1. concat all o3 css -> o3.css
            ocellusCss: {
                src: ['css/o3-*.css'],
                dest: 'css/o3.css',
            },

            // 6. concat all o3 js -> ocellus.js
            ocellusJs: {
                src: ['js/o3-*.js'],
                dest: 'js/o3.js',
            },

            // 5. concat all min css -> styles.min.css
            allCss: {
                src: [
                    'css/barebones.min.css', 
                    'css/auto-complete.min.css', 
                    //'node_modules/chart.js/dist/Chart.min.css',
                    //'css/vanilla-js-tabs.min.css',
                    'css/o3.min.css'
                ],
                dest: 'css/ocellus-bundle.min.css',
            },

            // 8, concat all min js -> scripts.min.js
            allJs: {
                src: [
                    'js/lazysizes.min.js', 
                    'js/mustache.min.js', 
                    'JavaScript-autoComplete/auto-complete.min.js',
                    //'node_modules/chart.js/dist/Chart.min.js',
                    //'node_modules/chartjs-plugin-datalabels/dist/chartjs-plugin-datalabels.min.js',
                    //'vanilla-js-tabs-master/dist/vanilla-js-tabs.min.js',
                    'js/o3.min.js'
                ],
                dest: 'js/ocellus-bundle.min.js',
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Default task(s).
    //grunt.registerTask('default', ['uglify', 'cssmin', 'concat']);
    grunt.registerTask(
        'default', 
        [
            // 1. concat all ocellus css -> ocellus.css
            "concat:ocellusCss", 
        
            // 2. minify ocellus.css -> ocellus.min.css
            "cssmin:ocellusCss",
        
            // 3. minify barebones.css -> barebones.min.css
            "cssmin:barebonesCss",
        
            // 4. minify autocomplete.css -> autocomplete.min.css
            "cssmin:autocompleteCss",

            // 4a. minify vanilla-js-tabs.css -> vanilla-js-tabs.min.css
            "cssmin:vanillaTabsCss",
        
            // 5. concat all min css -> styles.min.css
            "concat:allCss",
        
            // 6. concat all ocellus js -> ocellus.js
            "concat:ocellusJs",
        
            // 7. minify ocellus.js -> ocellus.min.js
            "uglify:ocellusJs",
        
            // 8, concat all min js -> scripts.min.js
            "concat:allJs"
        ]
    )
};