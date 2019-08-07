module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        "uglify-es": {
            options: {
                mangle: false
            },
            target: {
                files: {
                        'js/ocellus.min.js': [
                            // "js/lazysizes.min.js",
                            // "js/mustache.min.js",
                            // "JavaScript-autoComplete/auto-complete.min.js",
                            // "leaflet/leaflet.js",
                            // "node_modules/chart.js/dist/Chart.js",
                            // "node_modules/chartjs-plugin-datalabels/dist/chartjs-plugin-datalabels.min.js",
                            // "js/config.js",
                            "js/ocellus.js"
                        ]
                    }
            }
        },

        cssmin: {
            options: {
                mergeIntoShorthands: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    'css/styles.min.css': [
                        "Barebones-3.0.1/css/normalize.css",
                        "Barebones-3.0.1/css/barebones.css",
                        "leaflet/leaflet.css",
                        "JavaScript-autoComplete/auto-complete.css",
                        "css/ocellus.css",
                        "css/ocellus-header-title.css",
                        "css/ocellus-header-simple-search.css",
                        "css/ocellus-throbber.css",
                        "css/ocellus-communities-select-boxes.css",
                        "css/ocellus-treatments.css",
                        "css/ocellus-treatment.css",
                        "css/ocellus-taxon-tree.css",
                        "css/ocellus-xml.css"
                    ]
                }
            }
        },

        concat : {
            options : {
              sourceMap :true
            },
            // dist : {
            //   src  : ['www/js/**/*.js'],
            //   dest : '.tmp/main.js'
            // },
            target: {
                files: {
                        'js/scripts.min.js': [
                            "js/lazysizes.min.js",
                            "js/mustache.min.js",
                            "JavaScript-autoComplete/auto-complete.min.js",
                            "leaflet/leaflet.js",
                            "node_modules/chart.js/dist/Chart.js",
                            "node_modules/chartjs-plugin-datalabels/dist/chartjs-plugin-datalabels.min.js",
                            //"js/config.js",
                            "js/ocellus.js"
                        ]
                    }
            }
        },


    });

    grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Default task(s).
    grunt.registerTask('default', ['cssmin', 'concat']);
};