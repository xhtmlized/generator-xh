/**
 * Text Replace - replaces timestamp and toc variables in JS & CSS files.
 */
module.exports = function(grunt) {
  'use strict';

  // Replacements in main.css and main.js
  grunt.config('replace', {
    css: {
      src: ['<%%= xh.dist %>/css/main.css'],
      overwrite: true,
      replacements: [{
        from: '@@timestamp',
        to: '<%%= grunt.template.today() %>'
      },
      // Table of contents in main.css
      {
        from: '@@toc',
        to: function () {
          var tmp = grunt.config.get('xh.tmp');

          if (!grunt.file.exists(tmp + '/csstoc.json')) {
            return '';
          }

          var toc_file = grunt.file.readJSON(tmp + '/csstoc.json');
          var files = toc_file.results;
          var toc = '';
          var i = 1;
          var match;

          function capitalize(s) {
            return s[0].toUpperCase() + s.slice(1);
          }

          for (var file in files) {
            if (files.hasOwnProperty(file)) {

              var results = files[file];

              for (var result in results) {
                if (results.hasOwnProperty(result)) {

                  match = results[result]['match'];
                  match = match.replace(/"|'|@import|;|.scss|.less/gi, "").trim();
                  match = match.split('/').pop();
                  match = capitalize(match);

                  if (['Variables', 'Mixins', 'Placeholders'].indexOf(match) === -1) {
                    toc += '\n    ' + i + '. ' + match;
                    i++;
                  }
                }
              }
            }
          }
          return toc;
        }
      },
      // Add empty line after section & subsection comment
      {
        from: /=== \*\//g,
        to: '=== */\n'
      },
      // Add empty line after rule if it doesn't have one already
      {
        from: /}(?!\n\n)/gi,
        to: '}\n'
      }]
    },

    js: {
      src: ['<%%= xh.dist %>/js/main.js'],
      overwrite: true,
      replacements: [{
        from: '@@timestamp',
        to: '<%%= grunt.template.today() %>'
      }]
    }<% if (reloader !== 'None' && !server) { %>,

    reloader: {
      src: ['<%%= xh.includes %>/scripts.<%= extension %>'],
      overwrite: true,
      replacements: [{
        from: '@@reloader\n',
        to: ''
      }]
    }<% } %>
  });
};
