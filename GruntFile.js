module.exports = function (grunt) {

  grunt.initConfig({
    concat: {
      js: {
        src: ['Public/js/**/*.js'],
        dest: 'Public/build/scripts.js'
      },
      css: {
        src: [
          'Public/libs/bootstrap/dist/css/bootstrap.css',
          'Public/libs/font-awesome/css/font-awesome.css',
          'Public/css/style.css'
        ],
        dest: 'Public/build/styles.css'
      }
    },
    uglify: {
      build: {
        files: [{
            src: 'Public/build/scripts.js',
            dest: 'Public/build/scripts.js'
          }
        ]
      }
    },
    cssmin: {
      build: {
        files: [{
            src: 'Public/build/styles.css',
            dest: 'Public/build/styles.css'
          }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('run', function () {
    console.log('run');
  });

  grunt.registerTask('all', ['concat', 'uglify', 'cssmin']);
};