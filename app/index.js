'use strict';

var yeoman = require('yeoman-generator');
var utils = require('./utils/index');

var XhGenerator = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    this.option('config', {
      desc: 'Path to configuration file',
      type: String,
      alias: 'c'
    });

    this.option('interactive', {
      desc: 'Prompt user for info. Use --no-interactive for fully automated project generation based on config file. --no-interactive implies --skip-update & forcibly overwrites all files. Use with caution.',
      type: Boolean,
      defaults: true
    });

    this.option('skip-update', {
      desc: 'Skip update check.',
      type: Boolean,
      defaults: false
    });

    this.option('skip-install', {
      desc: 'Skip dependencies installation.',
      type: Boolean,
      defaults: false
    });
  },

  initializing: {
    checkIfInteractive: function () {
      if (this.options.interactive === false) {
        this.conflicter.force = true;
      }
    },

    checkForUpdate: function () {
      if (this.options['skip-update'] === false && this.options.interactive !== false) {
        var update = require('./update');
        update.apply(this);
      }
    },

    lookForConfigFile: function () {
      var checkConfig = require('./configcheck');

      checkConfig.fileContent.bind(this)()
        .then(checkConfig.result.bind(this),
              checkConfig.error.bind(this));
    }
  },

  prompting: function () {
    if (this.options.interactive === false || this.configFound) {
      return;
    }

    var done = this.async();

    // Welcome user
    if (this.configCorrupted !== true) {
      utils.welcome.bind(this)();
    }

    this.prompt(utils.prompts.generator, function (props) {
      utils.setProps.apply(this, [ props ]);
      done();
    }.bind(this));
  },

  configuring: function () {
    this._templateArgs = [ this.extension ];
    this._preprocessorArgs = (this.cssPreprocessor === 'SCSS' || this.cssPreprocessor === 'LIBSASS') ? ['scss', '_'] : ['less', ''];

    // Yeoman config file
    utils.generate.config.bind(this)();

    // Project configuration files
    utils.generate.dotfiles.bind(this)();

    // Application files
    utils.generate.appfiles.bind(this)();
  },

  writing: {
    base: function () {
      // Grunt modules
      utils.generate.gruntModules.bind(this)();

      // Project index
      utils.generate.projectInfo.bind(this)();

      // Assets directories
      utils.generate.assets.bind(this)();

      // Template files
      utils.generate.templateFiles.apply(this, this._templateArgs);

      // Styles
      utils.generate.preprocessor.apply(this, this._preprocessorArgs);

      if (this.features.useBootstrap) {
        utils.generate.bootstrap.apply(this, this._preprocessorArgs);
      }

      // JS
      utils.generate.js.bind(this)();
    },

    // WordPress
    wp: function () {
      if (this.isWP) {
        utils.generate.wp.apply(this, [].concat(this._preprocessorArgs, this._templateArgs));
      }
    },

    // Sprites
    sprites: function () {
      if (this.features.useSprites) {
        utils.generate.sprites.apply(this, this._preprocessorArgs);
      }
    },

    // CSS3Pie
    css3pie: function () {
      if (this.features.useCSS3Pie) {
        utils.generate.css3pie.bind(this)();
      }
    }
  },

  install: function () {
    this.installDependencies({
      skipInstall: this.options['skip-install']
    });
  }
});

module.exports = XhGenerator;
