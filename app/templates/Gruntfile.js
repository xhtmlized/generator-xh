module.exports = function (grunt) {
  'use strict';

  require('time-grunt')(grunt);

  // jit-grunt with static mappings
  require('jit-grunt')(grunt, {
    useminPrepare: 'grunt-usemin',
    includereplace: 'grunt-include-replace',
    replace: 'grunt-text-replace',
    validation: 'grunt-html-validation',<% if (features.useSprites) { %>
    sprite: 'grunt-spritesmith',<% } %>
    updatemain: 'grunt/update-main.js'
  });

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    // Configs
    xh: {
      src: 'src',
      dist: 'dist',
      tmp: '.tmp',
      usemin: ['{head,scripts}.<%= extension %>'],
      root: __dirname,
      includes: '<%%= xh.src %>/includes',
      designs: 'designs',
      assets: '{img,media,fonts,<%%= xh.designs %>}',
      images: '{img,media}' // used in imagemin
    }
  });

  // Load per-task config from separate files.
  grunt.loadTasks('grunt');

  grunt.registerTask('validate', [
    'validation',
    'notify:validation'
  ]);

  grunt.registerTask('postinstall', [<% if (!features.useBootstrap) { %>
    'copy:normalize',<% } %><% if (features.useCSS3Pie) { %>
    'copy:pie',<% } %>
    'copy:jquery'
  ]);

  grunt.registerTask('qa', 'Assure quality', [<% if (reloader !== 'None' && !server) { %>
    'replace:reloader',<% } %>
    'build',
    'validate',
    'jshint'
  ]);

  grunt.registerTask('build', 'Build site files', [
    'clean:dist',
    'postinstall',

    'build-usemin-min',
    'build-html',
    'build-assets',
    'updatemain',
    'build-css',
    'build-js',
    'build-beautify',<% if (isWP) { %>

    'copy:wp',<% } %>

    'clean:tmp',
    'notify:build'
  ]);

  grunt.registerTask('dev', 'Start a live-reloading dev webserver on localhost', [
    'postinstall'<% if (reloader === 'BrowserSync') { %>,
    'browserSync'<% } else if (reloader === 'LiveReload' && server) { %>,
    'connect:server'<% } %>,
    'build-usemin',
    'watch'
  ]);

  grunt.registerTask('default', ['dev']);
};
