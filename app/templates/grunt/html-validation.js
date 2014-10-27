module.exports = function(grunt) {
  'use strict';

  grunt.config('validation', {
    src: ['<%%= xh.dist %>/*.html'],
    options: {
      reset: true,
      relaxerror: [
        'Bad value X-UA-Compatible for attribute http-equiv on element meta.',
        'The frameborder attribute on the iframe element is obsolete. Use CSS instead.'
      ]
    }
  });

  grunt.loadNpmTasks('grunt-html-validation');
};