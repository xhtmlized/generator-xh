var async = require('async');
var numCPUs = require('os').cpus().length || 1;

module.exports = function (grunt) {
'use strict';

  grunt.registerMultiTask('update-main', 'Updates main.scss', function () {
    async.eachLimit(this.files, numCPUs, function (file, next) {
      var src = file.src[0];

      if (typeof src !== 'string') {
        src = file.orig.src[0];
      }

      console.log(this.files, src, next);
    });
  });

  grunt.config('update-main', {
    dist: {}
  });
};