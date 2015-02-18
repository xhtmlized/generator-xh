'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var config = require(process.cwd() + '/.yo-rc.json')['generator-xh'].config;
var path = require('path');

var WPGenerator = yeoman.generators.Base.extend({
  initializing: function () {
    if (!config.isWP) {
      this.log('This project was not set up as a WordPress project');
      process.exit();
    }

    if (yeoman.file.exists(config.wpFolder + '/wp-config.php')) {
      this.log('WordPress is already installed.');
      process.exit();
    }
  },

  prompting: function () {
    var done = this.async();

    // Welcome user
    this.log('');
    this.log(chalk.cyan(' **********************************************') + '\n');
    this.log(chalk.white('  Set up WordPress installation') + '\n');
    this.log(chalk.cyan(' **********************************************') + '\n');

    var prompts = [{
        name: 'databaseHost',
        message: 'Please enter the database host:',
        default: '$_SERVER[\'XTEAM_DB_HOST\']'
      }, {
        name: 'databaseName',
        message: 'Please enter the database name:',
        default: '$_SERVER[\'XTEAM_DB_NAME\']'
      }, {
        name: 'databaseUser',
        message: 'Please enter the database user:',
        default: '$_SERVER[\'XTEAM_DB_USER\']'
      }, {
        name: 'databasePassword',
        message: 'Please enter the database password:',
        default: '$_SERVER[\'XTEAM_DB_PASSWORD\']'
      }, {
        type: 'checkbox',
        name: 'features',
        message: 'Select additional features:',
        choices: [{
            name: 'WPized Light Base Theme',
            value: 'installWPizedLight',
            checked: true
        }, {
            name: 'WP Sync DB Plugin',
            value: 'installWpSyncDb',
            checked: true
        }, {
            name: 'Stream Plugin',
            value: 'installWpStream',
            checked: true
        }]
      }
    ];

    this.prompt(prompts, function (props) {
      this.databaseHost = props.databaseHost;
      this.databaseName = props.databaseName;
      this.databaseUser = props.databaseUser;
      this.databasePassword = props.databasePassword;
      this.features = props.features;

      var features = this.features;

      function hasFeature(feat) {
        return features.indexOf(feat) !== -1;
      }

      this.installWPizedLight = hasFeature('installWPizedLight');
      this.installWpSyncDb = hasFeature('installWpSyncDb');
      this.installWpStream = hasFeature('installWpStream');

      done();

    }.bind(this));
  },

  writing: {
    installWordPress: function () {
      var done = this.async();
      var self = this;

      this._getCurrentWpVersion(function(err, ver) {
        var username = 'wordpress';
        var repo = 'wordpress';
        var url = 'https://github.com/' + [username, repo, 'archive', ver].join('/') + '.zip';

        self.log.write()
          .info('... Fetching %s ...', url)
          .info(chalk.yellow('This might take a few moments'));

        // cannot use yeoman's remote() method
        // with user / repo / branch notation
        // since it downloads .tar.gz
        // and since WP tar.gz seems to have some weird files in it
        // there's an error during unpacking
        self.remote(url, function (err, remote) {
          if (err) {
            return done();
          }

          self.log('\nCopying WordPress ' + ver + '\n');

          self.conflicter.checkForCollision(config.wpFolder, null, function (err, status) {
            if (/force|create/.test(status)) {
              self._directory(remote.cachePath, config.wpFolder, process, true);
            }
          }.bind(self));

          self._createConfig(remote);

          done();
        });
      });

    },

    installWPizedLight: function () {
      if (!this.installWPizedLight) {
        return;
      }

      var done = this.async();
      var self = this;

      this.remote('xhtmlized', 'wpized-light', 'master', function (err, remote) {

        if (err) {
          return done(err);
        }

        self.log('\nCopying WPized Light Theme\n');

        // cannot use remote.bulkDirectory here
        // since we need to specify 'process' argument to update file contents
        var root = self.sourceRoot();
        self.sourceRoot(remote.cachePath);
        self.bulkDirectory('.', config.wpThemeFolder, self._updateThemeStyles);
        self.sourceRoot(root);

        done();
      }, true);

    },

    installWpSyncDb: function () {
      if (!this.installWpSyncDb) {
        return;
      }

      var done = this.async();
      var self = this;

      this.remote('wp-sync-db', 'wp-sync-db', 'master', function (err, remote) {

        if (err) {
          return done(err);
        }

        self.log('\nCopying WP Sync DB Plugin\n');

        remote.bulkDirectory('.', 'wp/wp-content/plugins/wp-sync-db');

        done();
      });
    },

    installWpStream: function () {
      if (!this.installWpStream) {
        return;
      }

      var done = this.async();
      var self = this;

      this.remote('x-team', 'wp-stream', 'master', function (err, remote) {

        if (err) {
          return done(err);
        }

        self.log('\nCopying Stream Plugin\n');

        remote.bulkDirectory('.', 'wp/wp-content/plugins/stream');

        done();
      });
    },

    createVhostFile: function () {
      var name = this._.slugify(config.projectName);
      this.documentRoot = process.cwd();
      this.serverName = 'dev-' + name + '.previewized.com';
      this.dbName = name;
      this.template('dev-vhost.conf', 'dev-vhost.conf');
    }
  },

  end: function () {
    this.log('\nAll done!');
  },

  /**
   * Find out current WordPress version from repository tags.
   */
  _getCurrentWpVersion: function (callback) {

    var latestVersion = '4.1';

    require('simple-git')().listRemote('--tags git://github.com/WordPress/WordPress.git', function (err, tagsList) {

      if (err) {
        return callback(err, latestVersion);
      }

      var tagList = ('' + tagsList).split('\n');
      tagList.pop();

      var lastTag = /\d\.\d(\.\d)?/ig.exec(tagList.pop());

      if (lastTag !== null) {
        latestVersion = lastTag[0];
      }

      callback(null, latestVersion);
    });

  },

  /**
   * Wrap setting in quotes if needed.
   */
  _getDbSetting: function (setting) {
    if (setting.indexOf('$_SERVER') !== -1) {
      return setting;
    } else {
      return '\'' + setting + '\'';
    }
  },

  /**
   * Create WP config file based on config sample from cache
   * (actual files won't be written to disk until conflicter finishes,
   * so we cannot just grab one from theme dir).
   */
  _createConfig: function (remote) {
    var prefix = this._.slugify(config.projectName).replace(/-/g, '_');

    var contents = this.fs.read(remote.cachePath + '/wp-config-sample.php')
      .replace('\'localhost\'', this._getDbSetting(this.databaseHost))
      .replace('\'database_name_here\'', this._getDbSetting(this.databaseName))
      .replace('\'username_here\'', this._getDbSetting(this.databaseUser))
      .replace('\'password_here\'', this._getDbSetting(this.databasePassword))
      .replace('wp_', prefix + '_');

    this.fs.write(config.wpFolder + '/wp-config.php', contents);
  },

  /**
   * Replace theme name in styles file before copy.
   */
  _updateThemeStyles: function (body, source, destination) {
    if (path.basename(destination) === 'style.css') {
      body = body.replace('WPized Light', config.projectName);
    }

    return body;
  }

});

module.exports = WPGenerator;