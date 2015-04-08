/*global describe, before, it */
'use strict';
var path = require('path');
var helpers = require('yeoman-generator').test;
var assert = require('yeoman-generator').assert;

describe('XH Generator Defaults', function () {
  before(function (done) {

    helpers
      .run(path.join(__dirname, '../app'))
      .inDir(path.join(__dirname, 'temp', 'defaults'))
      .withOptions({
        'skip-install': true,
        'skip-update': true
      })
      .withPrompt({
        projectName: 'Test Project',
        useBranding: true,
        reloader: 'BrowserSync',
        server: true,
        cssPreprocessor: 'LIBSASS',
        ignoreDist: true,
        isWP: true,
        features: ['useBootstrap', 'useModernizr', 'useCSS3Pie', 'useSprites']
      })
      .on('end', done);

  });

  it('creates configuration files', function (done) {
    var expectedFiles = [
      '.yo-rc.json',
      '.bowerrc',
      '.editorconfig',
      '.gitattributes',
      '.jshintrc',
      '.gitignore',
      'package.json',
      'bower.json',
      'README.md'
    ];

    assert.file(expectedFiles);
    done();
  });

  it('creates Grunt files', function (done) {
    var expectedFiles = [
      'Gruntfile.js',
      'grunt/autoprefixer.js',
      'grunt/browser-sync.js',
      'grunt/contrib-clean.js',
      'grunt/contrib-concat.js',
      'grunt/contrib-copy.js',
      'grunt/contrib-jshint.js',
      'grunt/contrib-uglify.js',
      'grunt/contrib-watch.js',
      'grunt/cssbeautifier.js',
      'grunt/html-validation.js',
      'grunt/include-replace.js',
      'grunt/jsbeautifier.js',
      'grunt/remfallback.js',
      'grunt/sass.js',
      'grunt/search.js',
      'grunt/spritesmith.js',
      'grunt/text-replace.js',
      'grunt/usemin.js',
      'grunt/build-helpers.js'
    ];

    assert.file(expectedFiles);
    done();
  });

  it('creates HTML structure', function (done) {
    var expectedFiles = [
      'index.html',
      'src/template.html',
      'src/includes/head.html',
      'src/includes/header.html',
      'src/includes/sidebar.html',
      'src/includes/scripts.html',
      'src/includes/footer.html'
    ];

    assert.file(expectedFiles);
    done();
  });

  it('creates SCSS structure', function (done) {
    var expectedFiles = [
      'src/scss/main.scss',
      'src/scss/setup/_variables.scss',
      'src/scss/setup/_mixins.scss',
      'src/scss/common/_utilities.scss',
      'src/scss/common/_layout.scss',
      'src/scss/components/.keep',
      'src/scss/vendor/.keep'
    ];

    assert.file(expectedFiles);
    done();
  });

  it('creates JS structure', function (done) {
    var expectedFiles = [
      'src/js/main.js'
    ];

    assert.file(expectedFiles);
    done();
  });

  it('creates assets structure', function (done) {
    var expectedFiles = [
      'src/fonts/.keep',
      'src/img/.keep',
      'src/media/.keep',
      'src/designs/.keep'
    ];

    assert.file(expectedFiles);
    done();
  });

  it('creates Bootstrap structure', function (done) {
    var expectedFiles = [
      'src/bootstrap.html',
      'src/scss/vendor/bootstrap/_variables.scss'
    ];

    assert.file(expectedFiles);
    done();
  });

  it('creates sprites structure', function (done) {
    var expectedFiles = [
      'src/img/sprites/1x/.keep',
      'src/img/sprites/2x/.keep',
      'src/scss/setup/_sprites.scss',
      'src/scss/setup/_sprites.scss.mustache'
    ];

    assert.file(expectedFiles);
    done();
  });

  it('creates WordPress structure', function (done) {
    var expectedFiles = [
      'src/wp.html',
      'src/scss/common/_wordpress.scss',
      'wp/wp-content/themes'
    ];

    assert.file(expectedFiles);
    done();
  });

  it('adds WordPress theme assets directories to .gitignore', function (done) {
    assert.fileContent('.gitignore', /(\nwp\/wp-content\/themes\/\*\*\/)img\1fonts\1js\1css\1media\n/gim);
    done();
  });

  it('adds WordPress uploads directory to .gitignore', function (done) {
    assert.fileContent('.gitignore', /\nwp\/wp-content\/uploads\n/gim);
    done();
  });

  it('creates CSS PIE file', function (done) {
    var expectedFiles = [
      'src/js/PIE.htc'
    ];

    assert.file(expectedFiles);
    done();
  });

  it('creates pages using \'page\' subgenerator', function (done) {
    var expectedFiles = [
      'src/home.html',
      'src/test.html'
    ];

    helpers
      .run(path.join(__dirname, '../page'), {
        tmpdir: false
      })
      .withArguments(['Home', 'Test'])
      .withOptions({
        'skip-build': true
      })
      .on('ready', function (generator) {
        generator.conflicter.force = true;
      })
      .on('end', function () {
        assert.file(expectedFiles);
        done();
      });
  });
});

