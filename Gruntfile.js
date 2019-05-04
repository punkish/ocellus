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
                        'blr/js/scripts-es.min.js': [
                            "blr/fancysearch/fancysearch.js",
                            "blr/js/config.js",
                            'js/ocellus.js',
                            "blr/js/facets.js"
                        ]
                    }
            }
        },

        "uglify": {
            options: {
                mangle: false
            },
            target: {
                files: {
                        'blr/js/scripts.min.js': [
                            "blr/js/cookies.js",
                            "js/lazysizes.min.js",
                            'js/mustache.min.js',
                            'JavaScript-autoComplete/auto-complete.js'

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
                    'blr/css/styles.min.css': [
                        "Skeleton-2.0.4/css/normalize-7.0.0.min.css",
                        "Skeleton-2.0.4/css/skeleton.min.css",
                        "JavaScript-autoComplete/auto-complete.css",
                        "blr/fancysearch/fancysearch.css",
                        "blr/css/ocellus.css",
                        "blr/css/xml.css",
                        'css/throbber.css'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // Default task(s).
    grunt.registerTask('default', ['uglify-es', 'uglify', 'cssmin']);
};