module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            options: {
                mangle: false
            },
            my_target: {
            files: {
                    'js/scripts.min.js': [
                        'js/mustache.min.js',
                        'JavaScript-autoComplete/auto-complete.js',
                        'js/family.min.js',
                        'js/ocellus.js'
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
                        'css/normalize.css',
                        'css/skeleton.css',
                        'css/auto-complete.min.css',
                        'css/ocellus.css',
                        'css/throbber.css'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'cssmin']);
};