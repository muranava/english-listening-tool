module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ''
      },
      dist: {
        src: ['src/rmin.js', 'src/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("dd-mm-yy") %> */\n',
        sourceMap: true
      },
      dist: {
        files: {
          'main.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    requirejs: {
      compile: {
        options: {
          mainConfigFile: "cfg/require.js",
          include: ['../vendor/require.min.js'],
          name: "main",
          out: "main.min.js"
        }
      }
    },
    jasmine : {
      src: 'src/rmin.js',
      options: {
        specs: 'test/rmin.js'
      }
    },
    jshint: {
      files: ['src/**/*.js', 'test/*.js'],
      options: {
        globals: {
          console: true,
          document: true
        }
      }
    }/*,
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'qunit']
    }*/
  });

  //grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  //grunt.loadNpmTasks('grunt-contrib-watch');
  //grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.registerTask('test', ['jshint', 'jasmine']);

  grunt.registerTask('default', [/*'jshint', */'jasmine', 'requirejs'/*, 'concat', 'uglify'*/]);

};

