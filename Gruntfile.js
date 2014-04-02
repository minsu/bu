/*
 * Gruntfile
 *
 * - to build for development, `grunt development`
 * - to build for release,     `grunt release`
 * - to run a local server,    `grunt server`
 * - to watch changes,         `grunt watch`
 */
module.exports = function(grunt) {

  var rewriteRulesSnippet = require(
    'grunt-connect-rewrite/lib/utils').rewriteRequest;

  grunt.initConfig({

    /* load package information */
    pkg: grunt.file.readJSON('package.json'),

    // grunt-env //
    env: {
      options: { /* shared options */ },
      development: {
        BUILD_MODE: 'DEVELOPMENT',
      },
      release: {
        BUILD_MODE: 'RELEASE'
      },
    },

    // grunt-preprocess //
    preprocess: {
      options: {
        context: {
          title      : '<%= pkg.name %>',
          author     : '<%= pkg.author %>',
          version    : '<%= pkg.version %>',
          keywords   : '<%= pkg.keywords %>',
          description: '<%= pkg.description %>',
        },
      },

      development: {
        src : 'app/index.html',
        dest: 'release/index.html',
      },
      release: {
        src : 'app/index.html',
        dest: 'release/index.html',
      },
    },

    // grunt-contrib-compass //
    compass: {
      development: {
        options: {
          outputStyle: 'expanded',
          sassDir    : 'app/styles',
          cssDir     : 'release/static/css',
          environment: 'development',
        },
      },
      release: {
        options: {
          outputStyle: 'compressed',
          sassDir    : 'app/styles',
          cssDir     : 'release/static/css',
          environment: 'production',
        },
      },
    },

    // grunt-contrib-watch //
    watch: {
      options: {
        interrupt : true,
        livereload: true,
      },
      sass: {
        files: ['app/styles/*.scss', 'app/styles/modules/*.scss'],
        tasks: ['env:development', 'compass:development'],
      },
      html: {
        files: ['app/index.html', 'app/views/**/*'],
        tasks: ['env:development', 'preprocess:development'],
      },
      scripts: {
        files: ['app/scripts/*.js', 'app/scripts/modules/*.js'],
        tasks: ['env:development', 'copy:scripts'],
      },
      resources: {
        files: ['app/static/**/*'],
        tasks: ['copy:resources'],
      },
    },

    // grunt-contrib-copy //
    copy: {
      scripts: {
        expand: true,
        cwd   : 'app/scripts',
        src   : ['**/*'],
        dest  : 'release/static/scripts/',
      },
      resources: {
        files: [{
          expand: true,
          cwd: 'app/static/',
          src: ['**'],
          dest: 'release/static/'
        }],
      },
      development: {
        files: [
          {expand: true, cwd: 'app/static/',  src: ['**'], dest: 'release/static/'},
          {expand: true, cwd: 'app/scripts/', src: ['**'], dest: 'release/static/scripts/'},
        ],
      },
      release: {
        files: [
          {expand: true, cwd: 'app/static/', src: ['**'], dest: 'release/static/'},
        ],
      },
    },

    // grunt-contrib-clean //
    clean: {
      development: ['release/**/*'],
      release    : ['release/**/*'],
      postrelease: [
        'release/temp/**/*',
        'release/static/css/app.css',
        'release/static/css/bu.css',
      ],
    },

    // grunt-contrib-cssmin //
    cssmin: {
      release: {
        options: {
          banner: '/* <%= pkg.name %>\n   Copyright 2014 <%= pkg.author %> */\n',
          report: 'min',
          keepSpecialComments: 0,
        },
        files: {
          'release/static/css/app.min.css': ['release/static/css/app.css'],
          'release/static/css/bu.min.css': ['release/static/css/bu.css'],
        }
      }
    },

    // grunt-contrib-uglify //
    uglify: {
      options: {
        mangle: true
      },
      release: {
        files: {
          'release/static/scripts/app.min.js': [
            'app/scripts/app.js',
          ],
          'release/static/scripts/bu.min.js': [
            'app/scripts/bu.js',
            'app/scripts/modules/bu.controller.js',
            'app/scripts/modules/bu.touch.js',
            'app/scripts/modules/bu.state.js',
            'app/scripts/modules/bu.actions.js',
            'app/scripts/modules/bu.events.js',
            'app/scripts/modules/bu.service.js',
            'app/scripts/modules/bu.keyboard.js',
            'app/scripts/modules/bu.component.bu.js',
            'app/scripts/modules/bu.component.misc.js',
            'app/scripts/modules/bu.component.message.js',
            'app/scripts/modules/bu.component.screen.js',
            'app/scripts/modules/bu.component.screens.js',
            'app/scripts/modules/bu.component.panel.js',
            'app/scripts/modules/bu.component.page.js',
            'app/scripts/modules/bu.component.pages.js',
            'app/scripts/modules/bu.component.condense.js',
            'app/scripts/modules/bu.component.flex.js',
          ],
          'release/static/scripts/vendor.min.js': [
            'src/scripts/vendor/modernizr.js',
            'src/scripts/vendor/jquery.min.js',
            'src/scripts/vendor/TweenMax.min.js',
            'src/scripts/vendor/lodash.min.js',

            'src/scripts/vendor/angular.min.js',
            'src/scripts/vendor/hammer.min.js',
          ],
        },
      },
    },

    // grunt-contrib-connect //

    connect: {
      options: {
        port      : 8000,
        base      : 'release',
        keepalive : true,
        hostname  : '*',
        livereload: true,
      },
      rules: [
        { // STATIC RESOURCES
          from: '^/static/(.*)$',
          to  : '/static/$1'
        },
        { // for ALL OTHERS
          from: '^(.*)$',
          to  : '/index.html'
        },
      ],
      development: {
        options: {
          middleware: function(connect, options) {
            return [
              rewriteRulesSnippet,
              connect.static(require('path').resolve('release')),
            ];
          },
        }
      }
    },

  });

  /* load plugins */
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-preprocess');

  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-connect-rewrite');


  /* tasks */
  grunt.registerTask('release', [
    /* preparation */
    'env:release',
    'clean:release',
    'copy:release',

    /* CSS/JavaScript */
    'compass:release', /* sass compile */
    'cssmin:release',
    'uglify:release',

    /* HTML */
    'preprocess:release',

    /* cleanup temporary files */
    'clean:postrelease',
  ]);

  grunt.registerTask('development', [
    /* preparation */
    'env:development',
    'clean:development',
    'copy:development',

    'compass:development',    /* sass compile */
    'preprocess:development', /* process HTML file */
  ]);

  grunt.registerTask('server', function(target) {
    grunt.task.run([
      'configureRewriteRules',
      'connect:development',
    ]);
  });

  grunt.registerTask('default', ['development']);
};