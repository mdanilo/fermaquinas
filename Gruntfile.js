module.exports = function (grunt) {
  grunt.initConfig({
    //terser
    terser: {
      options: {
        // Task-specific options go here.
      },
      your_target: {
        files: {
          'arquivos/all.min.js': 'assets/js/**/*.js',
        }
      },
    },
    //terser

    //sass
    sass: {
      dist: {
        files: {
          'assets/css/style.css': 'assets/css/sass/style.scss'
        }
      }
    },
    //sass

    // concat
    concat: {
      options: {
        separator: '',
      },
      dist: {
        src: ['assets/css/sprite.scss', 'assets/css/style.css'],
        dest: 'assets/css/all/all.css',
      },
    },
    // concat

    // css min
    cssmin: {
      combine: {
        files: {
          'arquivos/all.min.css': ['assets/css/all/all.css']
        }
      }
    },
    // css min

    // strip comments
    comments: {
      js: {
        options: {
          singleline: true,
          multiline: true
        },
        src: ['arquivos/all.min.js']
      },
      css: {
        options: {
          singleline: true,
          multiline: true
        },
        src: ['arquivos/all.min.css']
      }
    },
    // strip comments

    // watch
    watch: {
      dist: {
        files: [
          'assets/js/**/*',
          'assets/css/**/*',
          'assets/img/**/*'
        ],

        tasks: ['sass', 'concat', 'cssmin', 'terser', 'comments']
      }
    }
    // watch
  });

  // Plugins do Grunt
  grunt.loadNpmTasks('grunt-terser');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-svg-sprite');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-stripcomments');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Tarefas que serão executadas
  grunt.registerTask('default', ['sass', 'concat', 'cssmin', 'terser', 'comments']);

  // Tarefa para Watch
  grunt.registerTask('w', ['watch']);
};