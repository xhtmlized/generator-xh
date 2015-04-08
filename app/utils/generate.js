'use strict';

var helpers = {
  getStructure: function () {
    if (!helpers._stylesStructure) {
      helpers._stylesStructure = this.src.readJSON('stylesStructure.json');
    }

    return helpers._stylesStructure;
  },

  createStructure: function (structure, base, type, underscore) {
    var item, i, n, tn, dn;

    for (i = 0; i < structure.length; i++) {
      item = structure[i];

      if (item.dirname) {
        n = base + '/' + item.dirname;
        if (!item.children || !item.children.length) {
          this.fs.copy(this.templatePath('src/img/.keep'), this.destinationPath(n + '/.keep'));
        } else {
          helpers.createStructure.bind(this)(item.children, n, type, underscore);
        }
      } else {
        n = (base + '/' + item.name).replace('{{type}}', type);
        tn = this.templatePath(n);
        dn = this.destinationPath(n.replace('_', underscore));

        if (item.raw) {
          this.fs.copy(tn, dn);
        } else {
          this.fs.copyTpl(tn, dn, this);
        }
      }
    }
  }
};

var generate = {
  config: function () {
    this.config.set('config', this.props);
  },

  dotfiles: function () {
    this.copy('bowerrc', '.bowerrc');
    this.copy('editorconfig', '.editorconfig');
    this.copy('gitattributes', '.gitattributes');
    this.copy('jshintrc', '.jshintrc');
    this.template('gitignore', '.gitignore');
  },

  appfiles: function () {
    this.template('_package.json', 'package.json');
    this.template('_bower.json', 'bower.json');

    if (this.cssPreprocessor === 'SCSS') {
      this.copy('Gemfile');
    }
  },

  gruntModules: function () {
    this.template('Gruntfile.js');

    // read packages from packages.json
    // and include neccessary task config files
    var pkg = JSON.parse(this.engine(this.src.read('_package.json'), this)).devDependencies;
    var p, m, f;

    for (p in pkg) {
      m = p.match(/^grunt-(.+)$/i);
      if (m) {
        f = 'grunt/' + m[1] + '.js';
        if (this.src.exists(f)) {
          this.template(f);
        }
      }
    }

    // additional task files
    this.copy('grunt/build-helpers.js');
  },

  projectInfo: function () {
    this.template('_index.html', 'index.html');
    this.template('README.md');
  },

  assets: function () {
    this.copy('src/img/.keep', 'src/fonts/.keep');
    this.copy('src/img/.keep', 'src/img/.keep');
    this.copy('src/img/.keep', 'src/media/.keep');
    this.copy('src/img/.keep', 'src/designs/.keep');
  },

  templateFiles: function (ext) {
    this.copy('src/_template.html', 'src/template.' + ext);

    this.template('src/includes/_head.html', 'src/includes/head.' + ext);
    this.template('src/includes/_header.html', 'src/includes/header.' + ext);
    this.template('src/includes/_sidebar.html', 'src/includes/sidebar.' + ext);
    this.template('src/includes/_footer.html', 'src/includes/footer.' + ext);
    this.template('src/includes/_scripts.html', 'src/includes/scripts.' + ext);
  },

  preprocessor: function (type, underscore) {
    helpers.createStructure.bind(this)(helpers.getStructure.bind(this)().defaultStructure, 'src/' + type, type, underscore);
  },

  js: function () {
    this.template('src/js/_main.js', 'src/js/main.js');
  },

  wp: function (type, underscore, ext) {
    this.dest.mkdir(this.wpThemeFolder);
    this.copy('src/_wp.html', 'src/wp.' + ext);

    helpers.createStructure.bind(this)(helpers.getStructure.bind(this)().wp, 'src/' + type, type, underscore);
  },

  sprites: function (type, underscore) {
    this.copy('src/img/.keep', 'src/img/sprites/1x/.keep');
    this.copy('src/img/.keep', 'src/img/sprites/2x/.keep');

    helpers.createStructure.bind(this)(helpers.getStructure.bind(this)().sprites, 'src/' + type, type, underscore);
  },

  bootstrap: function (type, underscore, ext) {
    this.template('src/_bootstrap.html', 'src/bootstrap.' + ext);

    helpers.createStructure.bind(this)(helpers.getStructure.bind(this)().bootstrap, 'src/' + type, type, underscore);
  },

  css3pie: function () {
    this.copy('src/js/_PIE.htc', 'src/js/PIE.htc');
  }
};

module.exports = generate;
