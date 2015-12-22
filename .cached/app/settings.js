(function() {
  var PropertyAccessors, Settings, cson, dirs, fs, loadSetting, path, saveSetting, settingPath;

  fs = TOS.fs, path = TOS.path, cson = TOS.cson, dirs = TOS.dirs, PropertyAccessors = TOS.PropertyAccessors;

  settingPath = function(filename, cb) {
    var p;
    p = path.join(dirs.user, filename);
    return fs.stat(p, function(err, stats) {
      if (err == null) {
        return cb(err, p);
      } else {
        p = path.join(dirs.module, filename);
        return fs.stat(p, function(err, stats) {
          return cb(err, err == null ? p : null);
        });
      }
    });
  };

  loadSetting = function(filename, cb) {
    return settingPath(filename, function(err, p) {
      if (err == null) {
        return Object.load(p, function(err, data) {
          return cb(err, p, data);
        });
      }
    });
  };

  saveSetting = function(data, filename, cb) {
    return data.save(path.join(dirs.user, filename), cb);
  };

  Settings = Settings = (function() {
    PropertyAccessors.includeInto(Settings);

    function Settings(filename1, mode) {
      this.filename = filename1 != null ? filename1 : 'settings';
      this.mode = mode != null ? mode : 'cson';
      this.system = {};
      this.user = {};
      this.load();
    }

    Settings.prototype.accessor('sysPath', function() {
      if (this.isLocalStorage) {
        return this.filename + "_system";
      } else {
        return path.join(dirs.module, this.filename + "." + this.ext);
      }
    });

    Settings.prototype.accessor('userPath', function() {
      if (this.isLocalStorage) {
        return this.filename + "_user";
      } else {
        return path.join(dirs.user, this.filename + "." + this.ext);
      }
    });

    Settings.prototype.accessor('ext', function() {
      return this.mode;
    });

    Settings.prototype.accessor('serializer', function() {
      if (this.isCSON) {
        return cson;
      } else {
        return JSON;
      }
    });

    Settings.prototype.accessor('isCSON', function() {
      return this.mode === 'cson';
    });

    Settings.prototype.accessor('isJSON', function() {
      return this.mode === 'json';
    });

    Settings.prototype.accessor('isLocalStorage', function() {
      return this.mode === 'local';
    });

    Settings.prototype.load = function(cb) {
      var data;
      console.log("Loading settings...");
      if (this.isLocalStorage) {
        console.log("  system " + this.sysPath + "...");
        data = localStorage.getItem(this.sysPath);
        if (data.length) {
          this.system = this.serializer.parse(data);
        } else {
          this.system = {};
        }
        console.log("  user " + this.userPath + "...");
        data = localStorage.getItem(this.userPath);
        if (data.length) {
          this.user = this.serializer.parse(data);
        } else {
          this.user = {};
        }
        if (cb != null) {
          return cb(err);
        }
      } else {
        console.log("  system " + this.sysPath + "...");
        return fs.readFile(this.sysPath, function(err, data) {
          if (err == null) {
            if (data.length) {
              this.system = this.serializer.parse(data);
            } else {
              this.system = {};
            }
            console.log("  user " + this.userPath + "...");
            return fs.readFile(this.userPath, function(err, data) {
              if (err == null) {
                if (data.length) {
                  this.user = this.serializer.parse(data);
                } else {
                  this.user = {};
                }
              }
              if (cb != null) {
                return cb(err);
              }
            });
          } else {
            if (cb != null) {
              return cb(err);
            }
          }
        });
      }
    };

    Settings.prototype.save = function(cb) {
      var data;
      console.log("Saving user settings " + this.userPath + "...");
      data = this.serializer.stringify(this.user, null, 2);
      if (this.isLocalStorage) {
        localStorage.setItem(this.userPath, data);
        if (cb != null) {
          return cb(err);
        }
      } else {
        return fs.writeFile(this.userPath, data, function(err) {
          if (cb != null) {
            return cb(err);
          }
        });
      }
    };

    Settings.prototype.saveSync = function() {
      var data;
      console.log("Saving user settings " + this.userPath + "...");
      data = this.serializer.stringify(this.user, null, 2);
      if (this.isLocalStorage) {
        return localStorage.setItem(this.userPath, data);
      } else {
        return fs.writeFileSync(this.userPath, data);
      }
    };

    Settings.prototype.set = function(key, value, autosave) {
      if (autosave == null) {
        autosave = false;
      }
      _.setValueForKeyPath(this.user, key, value);
      if (autosave) {
        return this.save();
      }
    };

    Settings.prototype.get = function(key, defaultValue) {
      var v;
      if (defaultValue == null) {
        defaultValue = null;
      }
      v = _.valueForKeyPath(_.extend({}, this.system, this.user), key);
      if (v != null) {
        return v;
      } else {
        return defaultValue;
      }
    };

    Settings.prototype.push = function(key, value, autosave) {
      var v;
      if (autosave == null) {
        autosave = false;
      }
      v = this.get(key);
      if (_.isArray(v)) {
        v.push(value);
      }
      return this.set(key, v, autosave);
    };

    Settings.prototype.pop = function(key, autosave) {
      var v;
      if (autosave == null) {
        autosave = false;
      }
      v = this.get(key);
      if (_.isArray(v)) {
        v.pop();
      }
      return this.set(key, v, autosave);
    };

    Settings.prototype.remove = function(key, value, autosave) {
      var v;
      if (autosave == null) {
        autosave = false;
      }
      v = this.get(key);
      if (_.isArray(v)) {
        _.remove(v, value);
      }
      return this.set(key, v, autosave);
    };

    Settings.prototype.contains = function(key, value) {
      var v;
      v = this.get(key);
      if (_.isArray(v)) {
        return _.contains(v, value);
      } else {
        return false;
      }
    };

    return Settings;

  })();

  module.exports = {
    Settings: Settings,
    settings: new Settings(),
    settingPath: settingPath,
    loadSetting: loadSetting,
    saveSetting: saveSetting
  };

}).call(this);
