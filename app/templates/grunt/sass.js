/**
 * Sass - CSS preprocessor (libsass version)
 */
module.exports = function(grunt) {
  'use strict';

  grunt.config('sass', {
    dist: {
      options: {
        outputStyle: 'expanded',
        imagePath: '../img',
        includePaths: [
          '<%%= xh.src %>/bower_components'<% if (features.useBootstrap) { %>,
          '<%%= xh.src %>/bower_components/bootstrap-sass/assets/stylesheets'<% } %>
        ],
        // for some reason sourceMaps will have correct path only when
        // absolute source map path is used
        // sourceMap: '<%%= xh.root %>/<%%= xh.dist %>/css/main.css.map'
      },
      files: {
        '<%%= xh.dist %>/css/main.css': '<%%= xh.src %>/scss/main.scss'
      }
    }
  });
};
