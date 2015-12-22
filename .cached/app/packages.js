(function() {
  var Package, Packages, PropertyAccessors, _autoloaded, dirs, fs, npm, path, settings;

  fs = TOS.fs, path = TOS.path, dirs = TOS.dirs, npm = TOS.npm, settings = TOS.settings, PropertyAccessors = TOS.PropertyAccessors;

  _autoloaded = [];

  Package = Package = (function() {
    PropertyAccessors.includeInto(Package);

    function Package(name1, version, path1) {
      this.name = name1;
      this.version = version;
      this.path = path1;
      this._json = null;
    }

    Package.prototype.accessor('package', function() {
      return path.join(this.path, 'package.json');
    });

    Package.prototype.accessor('json', function() {
      if (this._json != null) {
        return this._json;
      }
      this._json = JSON.parse(fs.readFileSync(this["package"]));
      return this._json;
    });

    Package.prototype.accessor('main', function() {
      return path.join(this.path, this.json.main);
    });

    Package.prototype.accessor('version', function() {
      return path.join(this.path, this.json.version);
    });

    Package.prototype.accessor('author', function() {
      return path.join(this.path, this.json.author);
    });

    Package.prototype.accessor('isInstalled', function() {
      return TOS.packages.isInstalled(this.name);
    });

    Package.prototype.accessor('isLoaded', function() {
      return TOS.packages.isLoaded(this.name);
    });

    Package.prototype.install = function(cb) {
      return TOS.packages.install([this.name], cb);
    };

    Package.prototype.uninstall = function(cb) {
      return TOS.packages.uninstall([this.name], cb);
    };

    Package.prototype.load = function(spaces) {
      return TOS.packages.load([this.name], spaces);
    };

    Package.prototype.unload = function(spaces) {
      return TOS.packages.unload([this.name], spaces);
    };

    Package.prototype.publish = function() {
      return TOS.packages.publish(this.name);
    };

    return Package;

  })();

  Packages = Packages = (function() {
    PropertyAccessors.includeInto(Packages);

    function Packages() {}

    Packages.prototype.accessor('deps', function() {
      var ex, fn, n, nr, pkg, pn, r, v;
      this.init();
      pkg = JSON.parse(fs.readFileSync(dirs.user_pkg));
      r = (pkg != null) && (pkg.dependencies != null) ? pkg.dependencies : {};
      nr = [];
      for (n in r) {
        v = r[n];
        pn = path.join(dirs.user, v);
        fn = path.join(pn, n);
        ex = fs.existsSync(fn);
        nr.push(new module.exports.Package(n, (ex ? '0.0.0' : v), (ex ? pn : path.join(dirs.node_modules, n))));
      }
      return nr;
    });

    Packages.prototype.autoload = function(type) {
      var al, k, r, v;
      r = [];
      al = settings.get('autoload');
      if (type == null) {
        for (k in al) {
          v = al[k];
          r.push(k);
        }
      } else if (type === 'e') {
        for (k in al) {
          v = al[k];
          if (v) {
            r.push(k);
          }
        }
      } else if (type === 'd') {
        for (k in al) {
          v = al[k];
          if (!v) {
            r.push(k);
          }
        }
      }
      return r;
    };

    Packages.prototype.find = function(name) {
      var i, len, p, ref;
      ref = this.deps;
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        if (p.name === name) {
          return p;
        }
      }
      return null;
    };

    Packages.prototype.init = function() {
      var f;
      f = dirs.user_pkg;
      if (!fs.existsSync(f)) {
        return fs.writeFileSync(f, JSON.stringify({
          name: "my_termos_setup",
          "private": true,
          dependencies: {}
        }, null, '  '));
      }
    };

    Packages.prototype.install = function(names, cb) {
      this.init();
      if (names == null) {
        names = [];
      }
      return npm.load({
        prefix: dirs.user,
        save: true
      }, function() {
        return npm.commands.install(names, function(err) {
          var i, len, n;
          if (err != null) {
            throw err;
          } else {
            for (i = 0, len = names.length; i < len; i++) {
              n = names[i];
              settings.push('autoload', n);
            }
          }
          if (cb != null) {
            return cb(arguments);
          }
        });
      });
    };

    Packages.prototype.uninstall = function(names, cb) {
      this.init();
      return npm.load({
        prefix: dirs.user,
        save: true
      }, function() {
        return npm.commands.uninstall(names, function(err) {
          var i, len, n;
          if (err != null) {
            throw err;
          } else {
            for (i = 0, len = names.length; i < len; i++) {
              n = names[i];
              this.unload(n);
              settings.remove('autoload', n);
            }
          }
          if (cb != null) {
            return cb(arguments);
          }
        });
      });
    };

    Packages.prototype.isInstalled = function(name) {
      return this.find(name) != null;
    };

    Packages.prototype.isLoaded = function(name) {
      var i, len, p, ref;
      ref = TOS._autoloaded;
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        if (p.name === name) {
          return p;
        }
      }
      return null;
    };

    Packages.prototype.path = function(name) {
      var p;
      p = this.find(name);
      if (p != null) {
        return p.path;
      } else {
        return null;
      }
    };

    Packages.prototype["package"] = function(name) {
      var p;
      p = this.path(name);
      if (p != null) {
        return path.join(p, 'package.json');
      } else {
        return null;
      }
    };

    Packages.prototype.json = function(name) {
      var p;
      p = this["package"](name);
      if (p != null) {
        return JSON.parse(fs.readFileSync(p));
      } else {
        return null;
      }
    };

    Packages.prototype.main = function(name) {
      var j, p;
      p = this.path(name);
      j = this.json(name);
      if ((p != null) && (j != null)) {
        return path.join(p, j.main);
      } else {
        return null;
      }
    };

    Packages.prototype.version = function(name) {
      var j, p;
      p = this.path(name);
      j = this.json(name);
      if ((p != null) && (j != null)) {
        return path.join(p, j.version);
      } else {
        return null;
      }
    };

    Packages.prototype.author = function(name) {
      var j, p;
      p = this.path(name);
      j = this.json(name);
      if ((p != null) && (j != null)) {
        return path.join(p, j.author);
      } else {
        return null;
      }
    };

    Packages.prototype.load = function(names, spaces) {
      var i, l, len, len1, m, n, name, ref, results, results1;
      if (names != null) {
        if (spaces == null) {
          spaces = '';
        }
        results = [];
        for (i = 0, len = names.length; i < len; i++) {
          name = names[i];
          if (!this.isLoaded(name)) {
            if (this.isInstalled(name)) {
              m = require(this.main(name));
              if (m != null) {
                console.log("" + spaces + name + " loaded");
                TOS._autoloaded.push({
                  module: m,
                  name: name
                });
                results.push(m.load());
              } else {
                results.push(void 0);
              }
            } else {
              results.push(console.log("" + spaces + name + " ** not installed"));
            }
          } else {
            results.push(console.log("" + spaces + name + " ** already loaded"));
          }
        }
        return results;
      } else {
        console.log("Loading plugins...");
        ref = this.autoloads('e');
        results1 = [];
        for (l = 0, len1 = ref.length; l < len1; l++) {
          n = ref[l];
          results1.push(this.load(n, '  '));
        }
        return results1;
      }
    };

    Packages.prototype.unload = function(names, spaces) {
      var i, l, len, len1, name, p, ref, results, results1;
      if (names != null) {
        if (spaces == null) {
          spaces = '';
        }
        results = [];
        for (i = 0, len = names.length; i < len; i++) {
          name = names[i];
          p = this.isLoaded(name);
          if (p != null) {
            console.log("" + spaces + name + " unloaded");
            p.module.unload();
            results.push(_.remove(TOS._autoloaded, p));
          } else {
            results.push(console.log("" + spaces + name + " ** not loaded"));
          }
        }
        return results;
      } else {
        console.log("Unloading plugins...");
        ref = TOS._autoloaded;
        results1 = [];
        for (l = 0, len1 = ref.length; l < len1; l++) {
          p = ref[l];
          results1.push(this.unload(p.name, '  '));
        }
        return results1;
      }
    };

    Packages.prototype.publish = function(name) {};

    Packages.prototype.create = function(opts) {
      var name, p, pkg;
      name = "TOS-" + opts.name;
      p = this.path(name);
      fs.mkdirSync(p);
      if (opts.main == null) {
        opts.main = 'main.coffee';
      }
      if (opts.version == null) {
        opts.version = '0.0.1';
      }
      pkg = this["package"](name);
      if (pkg != null) {
        fs.writeFileSync(pkg, JSON.stringify(opts, null, '  '));
        fs.writeFileSync(this.main(name), '');
        return new module.exports.Package(name, opts.version, p);
      }
      return null;
    };

    return Packages;

  })();

  module.exports = {
    Package: Package,
    Packages: Packages,
    packages: new Packages()
  };

}).call(this);
