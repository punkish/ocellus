module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // 'uglify-es': {
    //   js: {
    //     src: 'js/ocellus.js',
    //     dest: 'js/ocellus.min.js'
    //   }
    // },

    cssmin: {
      target: {
        files: [{
          src: 'css/styles.css',
          dest: 'css/styles.min.css'
        }, {
          src: 'css/styles.css',
          dest: 'css/auto-complete.min.css'
        },{
          'css/all.min.css': ['css/styles.min.css', 'css/auto-complete.min.css']
        }]
      }
    },

    concat: {
      js: {
        options: {
          banner: '/*! Ocellus <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },
        src: [
          'js/family.min.js',
          'JavaScript-autoComplete/auto-complete.min.js',
          'js/ocellus.min.js'
        ],
        dest: 'js/all.min.js',
      },
      // css: {
      //   options: {
      //     banner: '/*! Ocellus <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      //   },
      //   src: [
      //     'css/styles.min.js',
      //     'JavaScript-autoComplete/auto-complete.min.css'
      //   ],
      //   dest: 'css/all.min.css',
      // }
    }
  });

  //grunt.loadNpmTasks('uglify-es');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', ['cssmin', 'concat']);
};