var async = require('async');
var path = require('path');
var fs = require('fs');

module.exports = function (grunt) {
  'use strict';

  grunt.config('updatemain', {
    build: {
      src: '<%%= xh.src %>/scss/**/*.scss'
    },
    options: {
      main: '<%%= xh.src %>/scss/main.scss'
    }
  });

  grunt.registerMultiTask('updatemain', 'Updates main.scss/less after new component file is added', function () {
    var self = this;
    var done = this.async();
    var mainStylesheet = this.options().main;

    async.eachLimit(this.files, 4, function (file, next) {
      var src = file.src;

      if (!src) {
        return next();
      }

      for (var i = 0; i < src.length; i++) {
        if (src[i] === mainStylesheet) {
          return next();
        }
        addFileToMain.bind(self)(src[i]);
      }

      next();
    }, done);

    function addFileToMain (file) {
      var root = path.join(grunt.config('xh').src, 'scss') + path.sep;
      var importFile = file.replace(root, '').replace(path.sep + '_', path.sep).replace(/\.(scss|less)$/, '');
      var mainStylesheet = this.options().main;

      fs.readFile(mainStylesheet, 'utf-8', 'r+', function (err, data) {
        if (err) throw err;
        writeToMainStylesheet(data, importFile);
      });
    }

    function writeToMainStylesheet (data, importFile) {
      var section = (importFile.split(path.sep) || ['default'])[0];
      var sectionComment = '// @@' + section;
      var importStylesheet = '@import "' + importFile + '";\n';
      var sectionCommentPosition = data.indexOf(sectionComment);
      var isImportStylesheetPresent = data.indexOf(importStylesheet) !== -1;

      if (sectionCommentPosition !== -1 && !isImportStylesheetPresent) {
        writeInsideMain();
      }
      else if (data.indexOf(sectionComment) === -1) {
        appendSectionToMain();
      }

      function writeInsideMain () {
        var newValue = data.slice(0, sectionCommentPosition) + importStylesheet + data.slice(sectionCommentPosition);
        fs.writeFile(mainStylesheet, newValue, 'utf-8', function (err) {
          if (err) throw err;
        });
      }

      function appendSectionToMain () {
        fs.appendFile(mainStylesheet, '\n' + importStylesheet + sectionComment, 'utf-8', function (err) {
          if (err) throw err;
        });
      }
    }
  });
};