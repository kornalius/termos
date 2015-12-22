(function() {
  var LFS, VFS, fs,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  fs = TOS.fs, VFS = TOS.VFS;

  TOS.LFS = LFS = (function(superClass) {
    extend(LFS, superClass);

    function LFS() {
      return LFS.__super__.constructor.apply(this, arguments);
    }

    LFS.prototype.isFile = function(path) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return _this.stats(path).then(function(stats) {
            if (stats.isFile()) {
              return resolve(true);
            } else {
              return reject(null);
            }
          })["catch"](function(err) {
            return reject(err);
          });
        };
      })(this));
    };

    LFS.prototype.isFolder = function(path) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return _this.stats(path).then(function(stats) {
            if (stats.isDirectory()) {
              return resolve(true);
            } else {
              return reject(null);
            }
          })["catch"](function(err) {
            return reject(err);
          });
        };
      })(this));
    };

    LFS.prototype.read = function(path) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return fs.readFile(path, function(err, data) {
            if (!err) {
              return resolve(data);
            } else {
              return reject(err);
            }
          });
        };
      })(this));
    };

    LFS.prototype.write = function(path, data) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return fs.writeFile(path, data, function(err) {
            if (!err) {
              return resolve(data);
            } else {
              return reject(err);
            }
          });
        };
      })(this));
    };

    LFS.prototype.exists = function(path) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return _this.stats(path).then(resolve(true))["catch"](err);
        };
      })(this));
    };

    LFS.prototype.stats = function(path) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return fs.stat(path, function(err, stats) {
            if (!err) {
              return resolve(stats);
            } else {
              return reject(err);
            }
          });
        };
      })(this));
    };

    LFS.prototype.size = function(path, deep) {
      if (deep == null) {
        deep = false;
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var that;
          that = _this;
          return _this.isFile(path).then(function() {
            return that.stats().then(function(stats) {
              return resolve(stats.size);
            })["catch"](function(err) {
              return reject(err);
            });
          })["catch"](function() {
            return that.files(deep).then(function() {
              var sz;
              sz = 0;
              return async.eachSeries(files, function(f, next) {
                return f.stats().then(function(stats) {
                  sz += stats.size;
                  return next();
                })["catch"](function(err) {
                  return next(err);
                });
              }, function(err) {
                if (!err) {
                  return resolve(sz);
                } else {
                  return reject(err);
                }
              });
            })["catch"](function(err) {
              return reject(err);
            });
          });
        };
      })(this));
    };

    LFS.prototype.files = function(path, deep) {
      if (deep == null) {
        deep = false;
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var that;
          that = _this;
          return fs.readdir(path, function(err, files) {
            var l;
            if (!err) {
              l = [];
              return async.eachSeries(files, function(f, next) {
                l.push(new File(f));
                return next();
              }, function(err) {
                if (!err) {
                  return resolve(l);
                } else {
                  return reject(err);
                }
              });
            } else {
              return reject(err);
            }
          });
        };
      })(this));
    };

    LFS.prototype.del = function(path) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var that;
          that = _this;
          return _this.isFolder(path).then(function() {
            return that.files(path).then(function(files) {
              return async.eachSeries(files, function(f, next) {
                return f.del().then(function() {
                  return next();
                })["catch"](function(err) {
                  return next(err);
                });
              }, function(err) {
                if (!err) {
                  return resolve(true);
                } else {
                  return reject(err);
                }
              });
            })["catch"](function(err) {
              return reject(err);
            });
          })["catch"](function() {
            return fs.unlink(path, function(err) {
              if (!err) {
                return resolve(true);
              } else {
                return reject(err);
              }
            });
          });
        };
      })(this));
    };

    LFS.prototype.rename = function(path, newName) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return fs.rename(path, newName, function(err) {
            if (!err) {
              return resolve(true);
            } else {
              return reject(err);
            }
          });
        };
      })(this));
    };

    LFS.prototype.mkdir = function(path) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return fs.mkdir(path, function(err) {
            if (!err) {
              return resolve(stats);
            } else {
              return reject(err);
            }
          });
        };
      })(this));
    };

    return LFS;

  })(VFS);

  window.lfs = new LFS();

}).call(this);
